import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";
import { db } from "~/server/db";
import { balanceStore } from "~/server/api/shared/balanceStore";

// Simulated transaction history
interface Transaction {
  id: string;
  walletAddress: string;
  amount: number;
  type: "receive" | "send";
  timestamp: Date;
  status: "pending" | "confirmed";
  recipient?: string;
  note?: string;
}

const transactions = new Map<string, Transaction[]>();

// Initialize Supabase client for username resolution
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const walletRouter = createTRPCRouter({
  /**
   * Get the current balance for a wallet address
   */
  getBalance: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      // In production, this would query the Tempo blockchain
      const balance = balanceStore.get(input.walletAddress);

      return {
        balance,
        walletAddress: input.walletAddress,
        currency: "USDC",
      };
    }),

  /**
   * Simulate receiving a paycheck (Faucet)
   * In production, this would:
   * 1. Transfer USDC from Treasury wallet to user wallet
   * 2. Return the transaction hash from Tempo Network
   */
  simulatePayroll: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        amount: z.number().min(1).default(500),
      }),
    )
    .mutation(async ({ input }) => {
      // Simulate blockchain delay (1-2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update balance using shared store
      const newBalance = balanceStore.add(input.walletAddress, input.amount);

      // Create transaction record
      const txId = `0x${Math.random().toString(16).substring(2, 66).padEnd(64, "0")}`;

      // Save to database
      await db.transaction.create({
        data: {
          id: txId,
          userId: input.walletAddress, // Use wallet address as userId for faucet
          walletAddress: input.walletAddress,
          type: "payroll",
          amount: input.amount,
          symbol: "USDC",
          status: "confirmed",
          description: "Test Faucet - Payroll",
          metadata: JSON.stringify({
            source: "faucet",
            txHash: txId,
          }),
        },
      });

      // Also store in memory for backward compatibility
      const transaction: Transaction = {
        id: txId,
        walletAddress: input.walletAddress,
        amount: input.amount,
        type: "receive",
        timestamp: new Date(),
        status: "confirmed",
      };

      const userTransactions = transactions.get(input.walletAddress) ?? [];
      userTransactions.unshift(transaction);
      transactions.set(input.walletAddress, userTransactions);

      return {
        success: true,
        transactionHash: txId,
        amount: input.amount,
        newBalance,
        message: `Successfully received ${input.amount} USDC`,
      };
    }),

  /**
   * Get transaction history for a wallet
   */
  getTransactions: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const userTransactions = transactions.get(input.walletAddress) ?? [];
      return {
        transactions: userTransactions,
        walletAddress: input.walletAddress,
      };
    }),

  /**
   * Get all transactions from database with filtering
   */
  getAllTransactions: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        limit: z.number().min(1).max(100).default(50),
        type: z.enum(["all", "send", "receive", "investment", "bill_pay", "payroll"]).default("all"),
      }),
    )
    .query(async ({ input }) => {
      const where: { walletAddress: string; type?: string } = {
        walletAddress: input.walletAddress,
      };

      if (input.type !== "all") {
        where.type = input.type;
      }

      const dbTransactions = await db.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      const formattedTransactions = dbTransactions.map((tx) => {
        let metadata: Record<string, unknown> | null = null;
        if (tx.metadata) {
          try {
            metadata = JSON.parse(tx.metadata) as Record<string, unknown>;
          } catch {
            metadata = null;
          }
        }

        return {
          id: tx.id,
          reference: tx.id.slice(0, 8).toUpperCase(),
          type: tx.type,
          amount: tx.amount,
          symbol: tx.symbol,
          status: tx.status,
          description: tx.description,
          recipient: metadata?.recipient as string | null ?? null,
          metadata,
          createdAt: tx.createdAt,
        };
      });

      return {
        transactions: formattedTransactions,
        walletAddress: input.walletAddress,
      };
    }),

  /**
   * Resolve username to wallet address
   * Searches Supabase users by email (username)
   */
  resolveUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      // Remove @ symbol if present
      const cleanUsername = input.username.replace(/^@/, "");

      // In production, you'd have a separate users table with usernames
      // For now, we'll search by email
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) {
        throw new Error("Failed to resolve username");
      }

      // Find user by email (treating email as username for now)
      const user = users.users.find(
        (u) => u.email?.toLowerCase() === cleanUsername.toLowerCase(),
      );

      if (!user) {
        throw new Error("User not found");
      }

      // Get wallet address from user metadata
      const walletAddress = user.user_metadata?.wallet_address as string | undefined;

      if (!walletAddress) {
        throw new Error("User has no wallet address");
      }

      return {
        username: cleanUsername,
        walletAddress,
        email: user.email,
      };
    }),

  /**
   * Transfer USDC to another wallet
   * In production, this would execute a transfer on Tempo Network
   */
  transferFunds: publicProcedure
    .input(
      z.object({
        fromWalletAddress: z.string(),
        toWalletAddress: z.string(),
        amount: z.number().min(0.01),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Simulate blockchain delay (1-2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check sender has sufficient balance
      if (!balanceStore.hasEnough(input.fromWalletAddress, input.amount)) {
        throw new Error("Insufficient balance");
      }

      // Deduct from sender and add to recipient
      balanceStore.subtract(input.fromWalletAddress, input.amount);
      balanceStore.add(input.toWalletAddress, input.amount);

      // Create transaction records
      const txId = `0x${Math.random().toString(16).substring(2, 66).padEnd(64, "0")}`;

      // Save sender transaction to database
      await db.transaction.create({
        data: {
          id: txId + "-send",
          userId: input.fromWalletAddress, // Use wallet address as userId
          walletAddress: input.fromWalletAddress,
          type: "send",
          amount: -input.amount,
          symbol: "USDC",
          status: "confirmed",
          description: `Sent to ${input.toWalletAddress.slice(0, 6)}...${input.toWalletAddress.slice(-4)}`,
          metadata: JSON.stringify({
            recipient: input.toWalletAddress,
            note: input.note,
            txHash: txId,
          }),
        },
      });

      // Save recipient transaction to database
      await db.transaction.create({
        data: {
          id: txId + "-receive",
          userId: input.toWalletAddress, // Use wallet address as userId
          walletAddress: input.toWalletAddress,
          type: "receive",
          amount: input.amount,
          symbol: "USDC",
          status: "confirmed",
          description: `Received from ${input.fromWalletAddress.slice(0, 6)}...${input.fromWalletAddress.slice(-4)}`,
          metadata: JSON.stringify({
            sender: input.fromWalletAddress,
            note: input.note,
            txHash: txId,
          }),
        },
      });

      // Also store in memory for backward compatibility
      const senderTx: Transaction = {
        id: txId,
        walletAddress: input.fromWalletAddress,
        amount: -input.amount,
        type: "send",
        timestamp: new Date(),
        status: "confirmed",
        recipient: input.toWalletAddress,
        note: input.note,
      };

      const recipientTx: Transaction = {
        id: txId,
        walletAddress: input.toWalletAddress,
        amount: input.amount,
        type: "receive",
        timestamp: new Date(),
        status: "confirmed",
        recipient: input.fromWalletAddress,
        note: input.note,
      };

      const senderTransactions = transactions.get(input.fromWalletAddress) ?? [];
      senderTransactions.unshift(senderTx);
      transactions.set(input.fromWalletAddress, senderTransactions);

      const recipientTransactions = transactions.get(input.toWalletAddress) ?? [];
      recipientTransactions.unshift(recipientTx);
      transactions.set(input.toWalletAddress, recipientTransactions);

      return {
        success: true,
        transactionHash: txId,
        amount: input.amount,
        newBalance: balanceStore.get(input.fromWalletAddress),
        message: `Successfully sent ${input.amount} USDC`,
        recipient: input.toWalletAddress,
      };
    }),
});
