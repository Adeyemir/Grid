import { api } from "~/trpc/react";

interface UseWalletBalanceOptions {
  walletAddress: string | null;
  pollingInterval?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Hook to fetch and poll wallet balance
 * Auto-refreshes at regular intervals to catch incoming transactions
 */
export function useWalletBalance({
  walletAddress,
  pollingInterval = 3000, // Default: poll every 3 seconds
  enabled = true,
}: UseWalletBalanceOptions) {
  const { data, isLoading, error, refetch } = api.wallet.getBalance.useQuery(
    { walletAddress: walletAddress ?? "" },
    {
      enabled: enabled && !!walletAddress,
      refetchInterval: pollingInterval,
      refetchOnWindowFocus: true,
      // Keep previous data while refetching to avoid flicker
      placeholderData: (previousData) => previousData,
    },
  );

  return {
    balance: data?.balance ?? 0,
    currency: data?.currency ?? "USDC",
    isLoading,
    error,
    refetch,
  };
}
