import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

// Simulated balance storage (in production, this would query the blockchain or Circle API)
const balances = new Map<string, number>();

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
      // In production, this would query Circle API or Arc blockchain
      const balance = balances.get(input.walletAddress) ?? 0;

      return {
        balance,
        walletAddress: input.walletAddress,
        currency: "USDC",
      };
    }),

  /**
   * Simulate receiving a paycheck (Faucet)
   * In production, this would:
   * 1. Call Circle Programmable Wallets API
   * 2. Transfer USDC from Treasury wallet to user wallet
   * 3. Return the transaction hash from Arc Network
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

      // Update balance
      const currentBalance = balances.get(input.walletAddress) ?? 0;
      const newBalance = currentBalance + input.amount;
      balances.set(input.walletAddress, newBalance);

      // Create transaction record
      const transaction: Transaction = {
        id: `0x${Math.random().toString(16).substring(2, 66).padEnd(64, "0")}`,
        walletAddress: input.walletAddress,
        amount: input.amount,
        type: "receive",
        timestamp: new Date(),
        status: "confirmed",
      };

      // Store transaction
      const userTransactions = transactions.get(input.walletAddress) ?? [];
      userTransactions.unshift(transaction);
      transactions.set(input.walletAddress, userTransactions);

      return {
        success: true,
        transactionHash: transaction.id,
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
   * In production, this would use Circle Programmable Wallets SDK executeTransfer
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
      const senderBalance = balances.get(input.fromWalletAddress) ?? 0;
      if (senderBalance < input.amount) {
        throw new Error("Insufficient balance");
      }

      // Deduct from sender
      balances.set(input.fromWalletAddress, senderBalance - input.amount);

      // Add to recipient
      const recipientBalance = balances.get(input.toWalletAddress) ?? 0;
      balances.set(input.toWalletAddress, recipientBalance + input.amount);

      // Create transaction records
      const txId = `0x${Math.random().toString(16).substring(2, 66).padEnd(64, "0")}`;

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

      // Store transactions
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
        newBalance: senderBalance - input.amount,
        message: `Successfully sent ${input.amount} USDC`,
        recipient: input.toWalletAddress,
      };
    }),
});
