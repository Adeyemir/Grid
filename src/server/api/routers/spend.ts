import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

// Mock bill providers (Story 5.1)
export const BILL_PROVIDERS = [
  {
    id: "mtn-data",
    name: "MTN Data",
    logo: "📱",
    type: "mobile_data" as const,
    description: "Buy mobile data bundles",
    fields: [
      { name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "080XXXXXXXX" },
      { name: "amount", label: "Amount (USDC)", type: "number", placeholder: "10.00" },
    ],
  },
  {
    id: "airtel-airtime",
    name: "Airtel Airtime",
    logo: "📞",
    type: "mobile_airtime" as const,
    description: "Recharge airtime instantly",
    fields: [
      { name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "080XXXXXXXX" },
      { name: "amount", label: "Amount (USDC)", type: "number", placeholder: "5.00" },
    ],
  },
  {
    id: "ikeja-electric",
    name: "Ikeja Electric",
    logo: "⚡",
    type: "electricity" as const,
    description: "Pay electricity bills",
    fields: [
      { name: "meterNumber", label: "Meter Number", type: "text", placeholder: "XXXXXXXXXX" },
      { name: "amount", label: "Amount (USDC)", type: "number", placeholder: "20.00" },
    ],
  },
  {
    id: "dstv",
    name: "DStv",
    logo: "📺",
    type: "tv_subscription" as const,
    description: "Renew TV subscription",
    fields: [
      { name: "smartcardNumber", label: "Smartcard Number", type: "text", placeholder: "XXXXXXXXXX" },
      { name: "amount", label: "Amount (USDC)", type: "number", placeholder: "25.00" },
    ],
  },
];

// Track spent balances (in production, this deducts from Circle wallet)
const spentBalances = new Map<string, number>();

export const spendRouter = createTRPCRouter({
  /**
   * Get available bill providers
   */
  getProviders: publicProcedure.query(async () => {
    return {
      providers: BILL_PROVIDERS,
    };
  }),

  /**
   * Pay a bill (Story 5.1: Bill Pay Simulation)
   */
  payBill: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        userId: z.string(),
        providerId: z.string(),
        amount: z.number().min(1),
        currentBalance: z.number(),
        metadata: z.record(z.string()).optional(), // Phone number, meter number, etc.
      }),
    )
    .mutation(async ({ input }) => {
      // Artificial delay (500ms) to simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 1. Verify user has enough USDC balance
      const totalSpent = spentBalances.get(input.walletAddress) ?? 0;
      const availableBalance = input.currentBalance - totalSpent;

      if (availableBalance < input.amount) {
        throw new Error("Insufficient USDC balance");
      }

      // 2. Get provider details
      const provider = BILL_PROVIDERS.find((p) => p.id === input.providerId);
      if (!provider) {
        throw new Error("Provider not found");
      }

      // 3. Track spent balance
      spentBalances.set(input.walletAddress, totalSpent + input.amount);

      // 4. Create transaction record
      const transaction = await db.transaction.create({
        data: {
          userId: input.userId,
          walletAddress: input.walletAddress,
          type: "bill_pay",
          amount: -input.amount, // Negative for deduction
          status: "confirmed",
          description: `Paid ${provider.name}`,
          metadata: JSON.stringify({
            provider: provider.name,
            providerId: input.providerId,
            ...input.metadata,
          }),
        },
      });

      return {
        success: true,
        transactionId: transaction.id,
        provider: provider.name,
        amount: input.amount,
        message: `Successfully paid ${provider.name}`,
        receipt: {
          providerName: provider.name,
          providerLogo: provider.logo,
          amount: input.amount,
          reference: transaction.id,
          network: "Tempo Network",
          timestamp: new Date().toISOString(),
          metadata: input.metadata,
        },
      };
    }),

  /**
   * Get spending history
   */
  getSpendingHistory: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const transactions = await db.transaction.findMany({
        where: {
          walletAddress: input.walletAddress,
          type: "bill_pay",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      });

      const totalSpent = transactions.reduce(
        (sum, tx) => sum + Math.abs(tx.amount),
        0,
      );

      return {
        transactions,
        totalSpent,
      };
    }),

  /**
   * Get total spent amount (for balance calculation)
   */
  getTotalSpent: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const spent = spentBalances.get(input.walletAddress) ?? 0;
      return { spent };
    }),
});
