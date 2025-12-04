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
import { WalletCard } from "~/components/WalletCard";
import { MobileNav } from "~/components/MobileNav";
import { createClient } from "~/lib/supabase/client";
import { useCreateWallet } from "~/hooks/useCreateWallet";
import { useWalletBalance } from "~/hooks/useWalletBalance";
import { usePrivacy } from "~/contexts/PrivacyContext";
import { api } from "~/trpc/react";
import { signOut } from "../login/actions";
import { cn } from "~/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { isPrivacyMode, togglePrivacy, maskValue } = usePrivacy();
  const [user, setUser] = useState<{
    email: string;
    authMethod: string;
    web3Address?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { walletAddress, isCreating, error } = useCreateWallet();

  // Determine which wallet address to display
  const displayWalletAddress = user?.authMethod === "wallet"
    ? user.web3Address
    : walletAddress;

  // Fetch wallet balance with auto-polling
  // Use displayWalletAddress to support both Circle and Web3 wallets
  const { balance, isLoading: balanceLoading } = useWalletBalance({
    walletAddress: displayWalletAddress ?? null,
    pollingInterval: 3000, // Poll every 3 seconds
    enabled: !!displayWalletAddress,
  });

  // Fetch portfolio for Net Worth calculation
  const { data: portfolioData } = api.invest.getPortfolio.useQuery(
    { walletAddress: displayWalletAddress ?? "" },
    { enabled: !!displayWalletAddress },
  );

  // Calculate Net Worth = Cash (USDC) + Investments
  const netWorth = balance + (portfolioData?.totalCurrentValue ?? 0);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user logged in via Web3 wallet
      const authMethod = user.user_metadata?.auth_method as string | undefined;
      const web3WalletAddress = user.user_metadata?.wallet_address as string | undefined;

      setUser({
        email: user.email ?? "",
        authMethod: authMethod ?? "email",
        web3Address: web3WalletAddress,
      });
      setLoading(false);
    }

    void getUser();
  }, [router]);

  async function handleSignOut() {
    await signOut();
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
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
              <span className="text-emerald-600">Grid</span> Dashboard
            </h1>
            <div className="flex items-center gap-2">
              {/* Privacy Toggle (Epic 6: Story 6.1) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePrivacy}
                className="rounded-xl h-10 w-10"
                title={isPrivacyMode ? "Show balances" : "Hide balances"}
              >
                {isPrivacyMode ? (
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-slate-300 hover:bg-slate-50 rounded-xl h-10"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Personalized Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              {/* Greeting */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Hi, {user?.email ? user.email.split("@")[0].toUpperCase() : "USER"}
                </h2>
                <p className="text-sm text-slate-500">Welcome back to Grid</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Support */}
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <svg
                  className="w-6 h-6 text-slate-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </button>

              {/* Notifications */}
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative">
                <svg
                  className="w-6 h-6 text-slate-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span className="absolute top-0 right-0 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>

          {/* Net Worth Card (Epic 4: Shows Cash + Investments) */}
          {portfolioData && portfolioData.assets.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 rounded-xl shadow-lg text-white">
              <CardHeader>
                <CardTitle className="text-white">Total Net Worth</CardTitle>
                <CardDescription className="text-slate-300">
                  Cash + Investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "text-5xl font-bold tabular-nums tracking-tight",
                  isPrivacyMode && "blur-md select-none"
                )}>
                  ${netWorth.toFixed(2)}{" "}
                  <span className="text-2xl text-slate-400 font-normal">USDC</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Cash</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      isPrivacyMode && "blur-md select-none"
                    )}>
                      ${balance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Investments</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      isPrivacyMode && "blur-md select-none"
                    )}>
                      ${(portfolioData?.totalCurrentValue ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balance Card with WalletCard Component */}
          <WalletCard
            balance={balance}
            isLoading={balanceLoading}
            currency="USDC"
            isPrivacyMode={isPrivacyMode}
          />


          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="bg-white border-emerald-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push("/transact")}
            >
              <CardHeader>
                <CardTitle className="text-lg text-emerald-600 flex items-center gap-2">
                  Transact
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Send & receive USDC</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  Click to explore →
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-emerald-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push("/invest")}
            >
              <CardHeader>
                <CardTitle className="text-lg text-emerald-600 flex items-center gap-2">
                  Grow
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Invest in stocks & yields</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  Click to explore →
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-600 flex items-center gap-2">
                  Spend
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">Pay bills & shop online</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/bills");
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                  >
                    Pay Bills
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/cards");
                    }}
                    variant="outline"
                    className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs"
                  >
                    View Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-violet-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push("/portfolio")}
            >
              <CardHeader>
                <CardTitle className="text-lg text-violet-600 flex items-center gap-2">
                  Portfolio
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Multi-chain wallet view</p>
                <p className="text-xs text-violet-600 font-medium mt-2">
                  View balances →
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation (Epic 6: Story 6.3) */}
      <MobileNav />
    </main>
  );
}
