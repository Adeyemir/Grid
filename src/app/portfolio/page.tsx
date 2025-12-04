"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { MobileNav } from "~/components/MobileNav";
import { createClient } from "~/lib/supabase/client";
import { api } from "~/trpc/react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";
import type { Address } from "viem";
import { formatUnits } from "viem";

// Mock USD prices (in production, fetch from CoinGecko or similar)
const USD_PRICES: Record<string, number> = {
  ETH: 2250,
  MATIC: 0.85,
  ARB: 1.15,
  OP: 2.1,
  USDC: 1.0,
  USDT: 1.0,
  DAI: 1.0,
};

interface TokenBalance {
  chain: string;
  chainId: number;
  symbol: string;
  balance: string;
  balanceFormatted: number;
  usdValue: number;
  logo: string;
  isStablecoin: boolean;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [user, setUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<TokenBalance | null>(null);

  // Get Grid wallet balance
  const displayWalletAddress = user?.email ? undefined : undefined; // Will get from Circle wallet
  const { data: gridBalance } = api.wallet.getBalance.useQuery(
    { walletAddress: displayWalletAddress ?? "" },
    { enabled: !!displayWalletAddress },
  );

  // Get user data
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email ?? "",
        });
      }
      setLoading(false);
    }

    void getUser();
  }, []);

  // Define chains with metadata
  const chains = [
    { chain: mainnet, name: "Ethereum", logo: "⟠", color: "from-blue-50 to-white border-blue-200" },
    { chain: polygon, name: "Polygon", logo: "🟣", color: "from-purple-50 to-white border-purple-200" },
    { chain: arbitrum, name: "Arbitrum", logo: "🔵", color: "from-cyan-50 to-white border-cyan-200" },
    { chain: base, name: "Base", logo: "🔷", color: "from-indigo-50 to-white border-indigo-200" },
    { chain: optimism, name: "Optimism", logo: "🔴", color: "from-red-50 to-white border-red-200" },
  ];

  // Fetch native balance for each chain
  const balances = chains.map(({ chain, name, logo, color }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useBalance({
      address: address as Address,
      chainId: chain.id,
    });

    const balanceFormatted = data ? parseFloat(data.formatted) : 0;
    const usdValue = balanceFormatted * (USD_PRICES[data?.symbol ?? "ETH"] ?? 0);

    return {
      chain: name,
      chainId: chain.id,
      symbol: data?.symbol ?? "ETH",
      balance: data?.formatted ?? "0",
      balanceFormatted,
      usdValue,
      logo,
      color,
      isStablecoin: false,
      isLoading,
    };
  });

  // Calculate total portfolio value
  const totalPortfolioValue = balances.reduce((sum, b) => sum + b.usdValue, 0);
  const gridWalletValue = (gridBalance?.balance ?? 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  // Not connected state
  if (!isConnected || !address) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 sm:pb-0">
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                <span className="text-emerald-600">Grid</span> Portfolio
              </h1>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-slate-300 hover:bg-slate-50 rounded-xl"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl shadow-lg">
              <CardContent className="pt-16 pb-16 text-center">
                <svg
                  className="w-20 h-20 text-emerald-600 mx-auto mb-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  No Wallet Connected
                </h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Import or connect a wallet to view your multi-chain portfolio and
                  bridge assets to Grid
                </p>
                <Button
                  onClick={() => router.push("/wallet/import")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 font-semibold"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Import Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <MobileNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 sm:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-emerald-600">Grid</span> Portfolio
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => disconnect()}
                className="border-slate-300 hover:bg-slate-50 rounded-xl text-sm"
              >
                {address.slice(0, 6)}...{address.slice(-4)}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-slate-300 hover:bg-slate-50 rounded-xl"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Grid Wallet Balance */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-700 rounded-xl shadow-lg text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg mb-1">
                    Grid Wallet (Arc Network)
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Your spending balance for Grid features
                  </CardDescription>
                </div>
                <svg
                  className="w-12 h-12 text-emerald-200"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{gridWalletValue.toFixed(2)}</span>
                <span className="text-2xl text-emerald-100">USDC</span>
              </div>
              <p className="text-emerald-100 mt-2 text-sm">
                ≈ ${gridWalletValue.toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          {/* Total Portfolio Value */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 rounded-xl shadow-lg text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">
                      ${(totalPortfolioValue + gridWalletValue).toFixed(2)}
                    </span>
                    <span className="text-slate-400 text-lg">USD</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Across {balances.length} chains + Grid wallet
                  </p>
                </div>
                <svg
                  className="w-16 h-16 text-slate-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Chain Balances */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
              Multi-Chain Assets
            </h2>
            <p className="text-slate-500 mb-6">
              Your balances across Ethereum, Polygon, Arbitrum, Base, and Optimism
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => (
                <Card
                  key={balance.chainId}
                  className={`bg-gradient-to-br ${balance.color} rounded-xl shadow-sm hover:shadow-md transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{balance.logo}</span>
                        <div>
                          <CardTitle className="text-lg text-slate-900">
                            {balance.chain}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Chain ID: {balance.chainId}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {balance.isLoading ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (
                      <>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {parseFloat(balance.balance).toFixed(4)} {balance.symbol}
                          </p>
                          <p className="text-sm text-slate-600">
                            ≈ ${balance.usdValue.toFixed(2)} USD
                          </p>
                        </div>

                        {balance.isStablecoin && balance.balanceFormatted > 0 && (
                          <Button
                            onClick={() => setSelectedAsset(balance)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                            Bridge to Grid
                          </Button>
                        )}

                        {!balance.isStablecoin && (
                          <div className="bg-white/50 p-2 rounded-lg">
                            <p className="text-xs text-slate-600 text-center">
                              Native asset - Bridging coming soon
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white border-slate-200 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Need more assets?
                  </h3>
                  <p className="text-sm text-slate-600">
                    Import another wallet or bridge more funds to Grid
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push("/wallet/import")}
                    variant="outline"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                  >
                    Import Wallet
                  </Button>
                  <Button
                    onClick={() => router.push("/transact")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    Send & Receive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bridge Modal Placeholder */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white rounded-xl">
            <CardHeader>
              <CardTitle>Bridge to Grid</CardTitle>
              <CardDescription>
                Transfer {selectedAsset.symbol} from {selectedAsset.chain} to Grid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-2">Available Balance</p>
                <p className="text-2xl font-bold text-slate-900">
                  {selectedAsset.balance} {selectedAsset.symbol}
                </p>
                <p className="text-sm text-slate-600">
                  ≈ ${selectedAsset.usdValue.toFixed(2)} USD
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-700 text-center">
                  🚧 Bridge functionality coming soon! This will allow you to transfer
                  stablecoins from any chain directly to your Grid wallet.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAsset(null)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  disabled
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl opacity-50"
                >
                  Bridge (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
