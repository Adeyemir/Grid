import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { balanceStore } from "~/server/api/shared/balanceStore";

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

      // 1. Verify user has enough USDC balance using shared store
      if (!balanceStore.hasEnough(input.walletAddress, input.usdcAmount)) {
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

      // 4. Deduct from wallet balance using shared store
      balanceStore.subtract(input.walletAddress, input.usdcAmount);

      // 5. Create transaction record
      const transaction = await db.transaction.create({
        data: {
          userId: input.userId,
          walletAddress: input.walletAddress,
          type: "investment",
          amount: -input.usdcAmount,
          symbol: input.symbol,
          status: "confirmed",
          description: `Bought ${amountOfAsset.toFixed(4)} ${input.symbol}`,
          metadata: JSON.stringify({
            action: "buy",
            sharesPurchased: amountOfAsset,
            pricePerShare: assetPrice,
          }),
        },
      });

      return {
        success: true,
        transactionId: transaction.id,
        assetSymbol: input.symbol,
        assetName: asset.name,
        amountPurchased: amountOfAsset,
        totalSpent: input.usdcAmount,
        pricePerUnit: assetPrice,
        message: `Successfully bought ${amountOfAsset.toFixed(4)} ${input.symbol}`,
        receipt: {
          transactionId: transaction.id,
          reference: transaction.id.slice(0, 8).toUpperCase(),
          type: "BUY",
          asset: input.symbol,
          assetName: asset.name,
          shares: amountOfAsset,
          pricePerShare: assetPrice,
          totalCost: input.usdcAmount,
          network: "Tempo Network",
          timestamp: new Date().toISOString(),
        },
      };
    }),

  /**
   * Sell a simulated asset
   */
  sellAsset: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        userId: z.string(),
        symbol: z.string(),
        sharesToSell: z.number().min(0.0001),
      }),
    )
    .mutation(async ({ input }) => {
      // Artificial delay (500ms) to feel like a real network request
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 1. Get user's position in this asset
      const existingAsset = await db.simulatedAsset.findFirst({
        where: {
          walletAddress: input.walletAddress,
          symbol: input.symbol,
        },
      });

      if (!existingAsset) {
        throw new Error("You don't own this asset");
      }

      if (existingAsset.amount < input.sharesToSell) {
        throw new Error(`Insufficient shares. You only own ${existingAsset.amount.toFixed(4)} shares`);
      }

      // 2. Get current asset price
      const asset = MOCK_ASSETS.find((a) => a.symbol === input.symbol);
      if (!asset) {
        throw new Error("Asset not found");
      }

      const currentPrice = asset.price;
      const saleProceeds = input.sharesToSell * currentPrice;
      const costBasis = input.sharesToSell * existingAsset.averageBuyPrice;
      const profitLoss = saleProceeds - costBasis;

      // 3. Update or delete position
      const remainingShares = existingAsset.amount - input.sharesToSell;

      if (remainingShares < 0.0001) {
        // Sell all - delete position
        await db.simulatedAsset.delete({
          where: { id: existingAsset.id },
        });
      } else {
        // Partial sell - update position
        const proportionSold = input.sharesToSell / existingAsset.amount;
        const investedSold = existingAsset.totalInvested * proportionSold;

        await db.simulatedAsset.update({
          where: { id: existingAsset.id },
          data: {
            amount: remainingShares,
            totalInvested: existingAsset.totalInvested - investedSold,
          },
        });
      }

      // 4. Add proceeds to wallet balance
      balanceStore.add(input.walletAddress, saleProceeds);

      // 5. Create transaction record
      const transaction = await db.transaction.create({
        data: {
          userId: input.userId,
          walletAddress: input.walletAddress,
          type: "investment",
          amount: saleProceeds,
          symbol: input.symbol,
          status: "confirmed",
          description: `Sold ${input.sharesToSell.toFixed(4)} ${input.symbol}`,
          metadata: JSON.stringify({
            action: "sell",
            sharesSold: input.sharesToSell,
            pricePerShare: currentPrice,
            costBasis,
            profitLoss,
          }),
        },
      });

      return {
        success: true,
        transactionId: transaction.id,
        assetSymbol: input.symbol,
        assetName: asset.name,
        sharesSold: input.sharesToSell,
        saleProceeds,
        pricePerUnit: currentPrice,
        costBasis,
        profitLoss,
        remainingShares,
        message: `Successfully sold ${input.sharesToSell.toFixed(4)} ${input.symbol}`,
        receipt: {
          transactionId: transaction.id,
          reference: transaction.id.slice(0, 8).toUpperCase(),
          type: "SELL",
          asset: input.symbol,
          assetName: asset.name,
          shares: input.sharesToSell,
          pricePerShare: currentPrice,
          totalProceeds: saleProceeds,
          costBasis,
          profitLoss,
          network: "Tempo Network",
          timestamp: new Date().toISOString(),
        },
      };
    }),

  /**
   * Get total amount invested (from database)
   */
  getInvestedAmount: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      // Calculate total invested from simulated assets
      const assets = await db.simulatedAsset.findMany({
        where: { walletAddress: input.walletAddress },
      });
      const invested = assets.reduce((sum, asset) => sum + asset.totalInvested, 0);
      return { invested };
    }),
});
