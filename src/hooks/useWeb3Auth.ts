import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { useRouter } from "next/navigation";

/**
 * Hook to handle Web3 wallet authentication using SIWE
 * Automatically triggers sign-in flow when wallet is connected
 */
export function useWeb3Auth() {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

  useEffect(() => {
    async function authenticateWithWallet() {
      if (!isConnected || !address || hasAttemptedAuth || isAuthenticating) {
        return;
      }

      setIsAuthenticating(true);
      setError(null);
      setHasAttemptedAuth(true);

      try {
        // Step 1: Fetch nonce from backend
        const nonceRes = await fetch("/api/auth/siwe/nonce");
        const { nonce } = (await nonceRes.json()) as { nonce: string };

        // Step 2: Create SIWE message
        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in to Grid - The Income Operating System",
          uri: window.location.origin,
          version: "1",
          chainId: chain?.id ?? 1,
          nonce,
        });

        const messageString = message.prepareMessage();

        // Step 3: Request signature from user
        const signature = await signMessageAsync({
          message: messageString,
        });

        // Step 4: Verify signature with backend
        const verifyRes = await fetch("/api/auth/siwe/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageString,
            signature,
          }),
        });

        if (!verifyRes.ok) {
          throw new Error("Failed to verify signature");
        }

        // Step 5: Redirect to dashboard on success
        router.push("/dashboard");
      } catch (err) {
        console.error("Error authenticating with wallet:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to authenticate with wallet",
        );
        setHasAttemptedAuth(false); // Allow retry
      } finally {
        setIsAuthenticating(false);
      }
    }

    void authenticateWithWallet();
  }, [
    isConnected,
    address,
    chain,
    hasAttemptedAuth,
    isAuthenticating,
    signMessageAsync,
    router,
  ]);

  return {
    isAuthenticating,
    error,
    address,
    isConnected,
  };
}
