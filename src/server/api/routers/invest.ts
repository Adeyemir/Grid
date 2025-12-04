import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

// Mock asset data (Story 4.2: Asset Directory)
// In production, these would come from a real market data API
const MOCK_ASSETS = [
  {
    symbol: "sTSLA",
    name: "Tesla Inc.",
    price: 242.84,
    change24h: 2.34,
    logo: "🚗",
    type: "stock" as const,
  },
  {
    symbol: "sAAPL",
    name: "Apple Inc.",
    price: 178.32,
    change24h: -0.87,
    logo: "🍎",
    type: "stock" as const,
  },
  {
    symbol: "sBTC",
    name: "Bitcoin",
    price: 42156.89,
    change24h: 5.67,
    logo: "₿",
    type: "crypto" as const,
  },
  {
    symbol: "sETH",
    name: "Ethereum",
    price: 2234.56,
    change24h: 3.21,
    logo: "Ξ",
    type: "crypto" as const,
  },
  {
    symbol: "sSPY",
    name: "S&P 500 ETF",
    price: 455.67,
    change24h: 1.12,
    logo: "📈",
    type: "etf" as const,
  },
  {
    symbol: "sGOOG",
    name: "Alphabet Inc.",
    price: 139.45,
    change24h: 1.89,
    logo: "🔍",
    type: "stock" as const,
  },
];

// Simulated balance tracker (in production, this would query Circle/Blockchain)
const investedBalances = new Map<string, number>();

export const investRouter = createTRPCRouter({
  /**
   * Get list of available assets (Story 4.2)
   */
  getAssets: publicProcedure.query(async () => {
    return {
      assets: MOCK_ASSETS,
    };
  }),

  /**
   * Get user's portfolio (simulated assets they own)
   */
  getPortfolio: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const assets = await db.simulatedAsset.findMany({
        where: {
          walletAddress: input.walletAddress,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate total value and gains
      let totalInvested = 0;
      let totalCurrentValue = 0;

      const enrichedAssets = assets.map((asset) => {
        const mockAsset = MOCK_ASSETS.find((a) => a.symbol === asset.symbol);
        const currentPrice = mockAsset?.price ?? asset.averageBuyPrice;
        const currentValue = asset.amount * currentPrice;
        const gain = currentValue - asset.totalInvested;
        const gainPercent = (gain / asset.totalInvested) * 100;

        totalInvested += asset.totalInvested;
        totalCurrentValue += currentValue;

        return {
          ...asset,
          name: mockAsset?.name ?? asset.symbol,
          logo: mockAsset?.logo ?? "📊",
          currentPrice,
          currentValue,
          gain,
          gainPercent,
        };
      });

      return {
        assets: enrichedAssets,
        totalInvested,
        totalCurrentValue,
        totalGain: totalCurrentValue - totalInvested,
        totalGainPercent:
          totalInvested > 0
            ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
            : 0,
      };
    }),

  /**
   * Buy a simulated asset (Story 4.3: The Mock Trade)
   */
  buyAsset: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        userId: z.string(),
        symbol: z.string(),
        usdcAmount: z.number().min(1),
        currentBalance: z.number(), // Real USDC balance
      }),
    )
    .mutation(async ({ input }) => {
      // Artificial delay (500ms) to feel like a real network request
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 1. Verify user has enough USDC balance
      if (input.currentBalance < input.usdcAmount) {
        throw new Error("Insufficient USDC balance");
      }

      // 2. Get asset price
      const asset = MOCK_ASSETS.find((a) => a.symbol === input.symbol);
      if (!asset) {
        throw new Error("Asset not found");
      }

      const assetPrice = asset.price;
      const amountOfAsset = input.usdcAmount / assetPrice;

      // 3. Check if user already owns this asset
      const existingAsset = await db.simulatedAsset.findFirst({
        where: {
          walletAddress: input.walletAddress,
          symbol: input.symbol,
        },
      });

      if (existingAsset) {
        // Update existing position (average down/up)
        const newTotalAmount = existingAsset.amount + amountOfAsset;
        const newTotalInvested = existingAsset.totalInvested + input.usdcAmount;
        const newAverageBuyPrice = newTotalInvested / newTotalAmount;

        await db.simulatedAsset.update({
          where: { id: existingAsset.id },
          data: {
            amount: newTotalAmount,
            totalInvested: newTotalInvested,
            averageBuyPrice: newAverageBuyPrice,
          },
        });
      } else {
        // Create new position
        await db.simulatedAsset.create({
          data: {
            userId: input.userId,
            walletAddress: input.walletAddress,
            symbol: input.symbol,
            amount: amountOfAsset,
            averageBuyPrice: assetPrice,
            totalInvested: input.usdcAmount,
          },
        });
      }

      // 4. Track invested balance (deduct from available USDC mentally)
      const currentInvested = investedBalances.get(input.walletAddress) ?? 0;
      investedBalances.set(
        input.walletAddress,
        currentInvested + input.usdcAmount,
      );

      // 5. Create transaction record
      await db.transaction.create({
        data: {
          userId: input.userId,
          walletAddress: input.walletAddress,
          type: "investment",
          amount: input.usdcAmount,
          symbol: input.symbol,
          status: "confirmed",
          description: `Bought ${amountOfAsset.toFixed(4)} ${input.symbol}`,
        },
      });

      return {
        success: true,
        assetSymbol: input.symbol,
        assetName: asset.name,
        amountPurchased: amountOfAsset,
        totalSpent: input.usdcAmount,
        pricePerUnit: assetPrice,
        message: `Successfully bought ${amountOfAsset.toFixed(4)} ${input.symbol}`,
      };
    }),

  /**
   * Get total amount invested (deducted from cash balance)
   */
  getInvestedAmount: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const invested = investedBalances.get(input.walletAddress) ?? 0;
      return { invested };
    }),
});
