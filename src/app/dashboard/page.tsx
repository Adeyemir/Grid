"use client";

import { useEffect, useState, useRef } from "react";
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
import { UsernameSetup } from "~/components/UsernameSetup";
import { useGridAuth } from "~/hooks/useGridAuth";
import { useWalletBalance } from "~/hooks/useWalletBalance";
import { usePrivacy } from "~/contexts/PrivacyContext";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Receipt,
  Wallet,
  Clock
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isPrivacyMode, togglePrivacy } = usePrivacy();
  const { user, ready, isAuthenticated, logout, walletAddress } = useGridAuth();
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  // Use the Privy wallet address
  const displayWalletAddress = walletAddress;

  // Fetch user profile
  const { data: profileData, refetch: refetchProfile } = api.user.getProfile.useQuery(
    { privyUserId: user?.id ?? "" },
    { enabled: !!user?.id }
  );

  // Update profile mutation (for fixing missing wallet addresses)
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void refetchProfile();
    }
  });

  // Ref to track if we've attempted the wallet fix
  const walletFixAttempted = useRef(false);

  // Check if user needs to set up username
  // Only show setup when wallet is also ready to ensure walletAddress is captured
  useEffect(() => {
    if (ready && isAuthenticated && user?.id && profileData === null && displayWalletAddress) {
      // User is authenticated, has wallet, but has no profile - show setup
      setShowUsernameSetup(true);
    }
  }, [ready, isAuthenticated, user?.id, profileData, displayWalletAddress]);

  // Auto-fix profiles missing wallet address (only run once per session)
  useEffect(() => {
    if (
      !walletFixAttempted.current &&
      ready &&
      isAuthenticated &&
      user?.id &&
      profileData &&
      !profileData.walletAddress &&
      displayWalletAddress
    ) {
      walletFixAttempted.current = true;
      // Profile exists but missing wallet address - update it
      updateProfile.mutate({
        privyUserId: user.id,
        walletAddress: displayWalletAddress,
      });
    }
  }, [ready, isAuthenticated, user?.id, profileData, displayWalletAddress, updateProfile]);

  // Fetch wallet balance with auto-polling
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

  // Fetch transaction history
  const { data: transactionsData } = api.wallet.getAllTransactions.useQuery(
    { walletAddress: displayWalletAddress ?? "", limit: 10, type: "all" },
    { enabled: !!displayWalletAddress, refetchInterval: 5000 },
  );

  // Calculate Net Worth = Cash (USDC) + Investments
  const netWorth = balance + (portfolioData?.totalCurrentValue ?? 0);

  // Helper to get transaction icon
  const getTransactionIcon = (type: string, amount: number) => {
    switch (type) {
      case "investment":
        return amount < 0
          ? <TrendingUp className="w-4 h-4 text-emerald-600" />
          : <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "bill_pay":
        return <Receipt className="w-4 h-4 text-orange-600" />;
      case "send":
        return <ArrowUpRight className="w-4 h-4 text-rose-600" />;
      case "receive":
      case "payroll":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      default:
        return <Wallet className="w-4 h-4 text-slate-600" />;
    }
  };

  // Helper to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push("/login");
    }
  }, [ready, isAuthenticated, router]);

  // Get user display info - prioritize profile, then Privy
  const userEmail = user?.email?.address ?? user?.google?.email ?? user?.twitter?.username ?? "";
  const profileDisplayName = profileData?.displayName ?? profileData?.username;
  const fallbackName = user?.google?.name ?? user?.twitter?.username ?? userEmail.split("@")[0];
  const userName = profileDisplayName ?? fallbackName ?? "USER";
  const userInitial = userName.charAt(0).toUpperCase();

  // Suggested name for username setup
  const suggestedName = user?.google?.name ?? user?.twitter?.username ?? userEmail.split("@")[0] ?? "";

  function handleSignOut() {
    logout();
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text);
  }

  // Show loading while Privy initializes or redirecting
  if (!ready || !isAuthenticated) {
    return (
      <main className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
        <div className="container mx-auto px-4 py-16 max-w-full">
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 pb-20 sm:pb-0 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 w-full">
        <div className="container mx-auto px-4 py-4 max-w-full">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              <span className="text-emerald-600">Grid</span> Dashboard
            </h1>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-slate-300 hover:bg-slate-50 rounded-lg sm:rounded-xl h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap flex-shrink-0"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-full">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Personalized Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-white rounded-xl sm:rounded-2xl border border-slate-200 w-full">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-lg sm:text-xl font-bold">
                  {userInitial}
                </span>
              </div>
              {/* Greeting */}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[300px]">
                  Hi, {userName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate">Welcome back to Grid</p>
              </div>
            </div>

          </div>

          {/* Net Worth Card (Epic 4: Shows Cash + Investments) */}
          {portfolioData && portfolioData.assets.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 rounded-xl shadow-lg text-white w-full max-w-full">
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg sm:text-xl">Total Net Worth</CardTitle>
                    <CardDescription className="text-slate-300 text-sm">
                      Cash + Investments
                    </CardDescription>
                  </div>
                  <button
                    onClick={togglePrivacy}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title={isPrivacyMode ? "Show balance" : "Hide balance"}
                  >
                    {isPrivacyMode ? (
                      <svg
                        className="w-5 h-5 text-slate-300"
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
                        className="w-5 h-5 text-slate-300"
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
                  </button>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className={cn(
                  "text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums tracking-tight break-words",
                  isPrivacyMode && "blur-md select-none"
                )}>
                  ${netWorth.toFixed(2)}{" "}
                  <span className="text-xl sm:text-2xl text-slate-400 font-normal">USDC</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
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
            onTogglePrivacy={togglePrivacy}
          />


          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
            <Card
              className="bg-white border-emerald-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer w-full max-w-full"
              onClick={() => router.push("/transact")}
            >
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg text-emerald-600 flex items-center gap-2">
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
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm text-slate-600">Send & receive USDC</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  Click to explore →
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-emerald-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer w-full max-w-full"
              onClick={() => router.push("/invest")}
            >
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg text-emerald-600 flex items-center gap-2">
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
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm text-slate-600">Invest in stocks & yields</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  Click to explore →
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer w-full max-w-full">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg text-emerald-600 flex items-center gap-2">
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
              <CardContent className="space-y-3 px-4 sm:px-6">
                <p className="text-sm text-slate-600">Pay bills & shop online</p>
                <div className="flex gap-2 w-full">
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

          </div>

          {/* Transaction History */}
          <Card className="bg-white border-slate-200 rounded-xl w-full">
            <CardHeader className="px-4 sm:px-6 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-500" />
                  Recent Activity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/transact")}
                  className="text-emerald-600 hover:text-emerald-700 text-xs"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                <div className="space-y-1">
                  {transactionsData.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center",
                          tx.type === "investment" && tx.amount < 0 && "bg-emerald-100",
                          tx.type === "investment" && tx.amount >= 0 && "bg-blue-100",
                          tx.type === "bill_pay" && "bg-orange-100",
                          tx.type === "send" && "bg-rose-100",
                          (tx.type === "receive" || tx.type === "payroll") && "bg-emerald-100",
                          !["investment", "bill_pay", "send", "receive", "payroll"].includes(tx.type) && "bg-slate-100"
                        )}>
                          {getTransactionIcon(tx.type, tx.amount)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {tx.description}
                          </p>
                          <p className="text-xs text-slate-500" suppressHydrationWarning>
                            {formatRelativeTime(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-semibold tabular-nums",
                          isPrivacyMode && "blur-sm",
                          tx.amount >= 0 ? "text-emerald-600" : "text-slate-900"
                        )}>
                          {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                        {tx.symbol && (
                          <p className="text-xs text-slate-500">{tx.symbol}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No transactions yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your activity will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Navigation (Epic 6: Story 6.3) */}
      <MobileNav />

      {/* Username Setup Dialog */}
      <UsernameSetup
        isOpen={showUsernameSetup}
        onComplete={(username) => {
          setShowUsernameSetup(false);
          void refetchProfile();
        }}
        privyUserId={user?.id ?? ""}
        walletAddress={displayWalletAddress ?? undefined}
        suggestedName={suggestedName}
      />
    </main>
  );
}
