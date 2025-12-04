"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { env } from "~/env";

interface WalletContextType {
  isInitialized: boolean;
  walletAddress: string | null;
  createWallet: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  isInitialized: false,
  walletAddress: null,
  createWallet: async () => {},
  error: null,
});

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load wallet address from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAddress = localStorage.getItem("grid_wallet_address");
      if (storedAddress) {
        setWalletAddress(storedAddress);
      }
    }
    // Always set initialized to true - we'll use simulated wallets
    setIsInitialized(true);
  }, []);

  const createWallet = async () => {
    try {
      setError(null);
      
      // Create a simulated wallet address for demo/testnet
      const mockWalletAddress = `0x${Math.random().toString(16).substring(2, 42).padEnd(40, "0")}`;
      setWalletAddress(mockWalletAddress);

      if (typeof window !== "undefined") {
        localStorage.setItem("grid_wallet_address", mockWalletAddress);
      }

      console.log("Wallet created:", mockWalletAddress);
    } catch (err) {
      console.error("Failed to create wallet:", err);
      setError("Failed to create wallet");
    }
  };

  const value: WalletContextType = {
    isInitialized,
    walletAddress,
    createWallet,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}