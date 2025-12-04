import { useEffect, useState } from "react";
import { useWallet } from "~/lib/wallet/WalletProvider";

/**
 * Hook that automatically creates a wallet for the user if they don't have one.
 * This should be called after successful authentication.
 */
export function useCreateWallet() {
  const { walletAddress, createWallet, isInitialized, error } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function initWallet() {
      // Only attempt to create wallet if:
      // 1. SDK is initialized
      // 2. User doesn't have a wallet yet
      // 3. We're not already creating one
      if (isInitialized && !walletAddress && !isCreating) {
        setIsCreating(true);
        try {
          await createWallet();
        } catch (err) {
          console.error("Failed to create wallet:", err);
        } finally {
          setIsCreating(false);
        }
      }
    }

    void initWallet();
  }, [isInitialized, walletAddress, createWallet, isCreating]);

  return {
    walletAddress,
    isCreating,
    error,
  };
}
