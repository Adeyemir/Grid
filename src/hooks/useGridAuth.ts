"use client";

import { usePrivy, useWallets, type ConnectedWallet } from "@privy-io/react-auth";
import { useMemo } from "react";

export function useGridAuth() {
    const {
        login,
        logout,
        user,
        ready,
        authenticated,
        createWallet,
    } = usePrivy();

    const { wallets } = useWallets();

    const walletAddress = useMemo(() => {
        // 1. Prefer embedded wallet if available (Privy created)
        const embeddedWallet = wallets.find(
            (wallet: ConnectedWallet) => wallet.walletClientType === "privy",
        );
        if (embeddedWallet) return embeddedWallet.address;

        // 2. Fallback to any connected wallet (e.g. MetaMask)
        if (wallets.length > 0) return wallets[0]?.address;

        return null;
    }, [wallets]);

    return {
        login,
        logout,
        user,
        ready,
        isAuthenticated: authenticated,
        walletAddress,
        createWallet,
    };
}