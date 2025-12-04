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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { createClient } from "~/lib/supabase/client";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { MobileNav } from "~/components/MobileNav";

export default function InvestPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    authMethod: string;
    web3Address?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState("");

  // Get user data
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!supabaseUser) {
        router.push("/login");
        return;
      }

      const authMethod = supabaseUser.user_metadata?.auth_method as string | undefined;
      const web3WalletAddress = supabaseUser.user_metadata?.wallet_address as string | undefined;

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        authMethod: authMethod ?? "email",
        web3Address: web3WalletAddress,
      });
      setLoading(false);
    }

    void getUser();
  }, [router]);

  // Fetch available assets
  const { data: assetsData, isLoading: assetsLoading } =
    api.invest.getAssets.useQuery();

  // Fetch user's balance
  const displayWalletAddress =
    user?.authMethod === "wallet" ? user.web3Address : undefined;
  const { data: balanceData } = api.wallet.getBalance.useQuery(
    { walletAddress: displayWalletAddress ?? "" },
    { enabled: !!displayWalletAddress },
  );

  // Fetch user's portfolio
  const { data: portfolioData, refetch: refetchPortfolio } =
    api.invest.getPortfolio.useQuery(
      { walletAddress: displayWalletAddress ?? "" },
      { enabled: !!displayWalletAddress },
    );

  // Buy asset mutation
  const buyAsset = api.invest.buyAsset.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully bought ${data.amountPurchased.toFixed(4)} ${data.assetSymbol}!`, {
        description: `Invested $${data.totalSpent.toFixed(2)} USDC`,
      });
      setSelectedAsset(null);
      setBuyAmount("");
      void refetchPortfolio();
    },
    onError: (error) => {
      toast.error("Purchase failed", {
        description: error.message,
      });
    },
  });

  const handleBuyClick = (symbol: string) => {
    console.log("Buy button clicked for symbol:", symbol);
    setSelectedAsset(symbol);
  };

  const handleBuySubmit = () => {
    console.log("Buy submit clicked");
    if (!user || !displayWalletAddress || !selectedAsset || !buyAmount) {
      console.log("Missing required data:", { user, displayWalletAddress, selectedAsset, buyAmount });
      return;
    }

    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) {
      console.log("Invalid amount:", amount);
      toast.error("Invalid amount");
      return;
    }

    console.log("Executing buy mutation:", {
      walletAddress: displayWalletAddress,
      userId: user.id,
      symbol: selectedAsset,
      usdcAmount: amount,
      currentBalance: balanceData?.balance ?? 0,
    });

    buyAsset.mutate({
      walletAddress: displayWalletAddress,
      userId: user.id,
      symbol: selectedAsset,
      usdcAmount: amount,
      currentBalance: balanceData?.balance ?? 0,
    });
  };

  const selectedAssetData = assetsData?.assets.find(
    (a) => a.symbol === selectedAsset,
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
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
              <span className="text-emerald-600">Grid</span> Invest
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

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Portfolio Summary */}
          {portfolioData && portfolioData.assets.length > 0 && (
            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900">Your Portfolio</CardTitle>
                <CardDescription className="text-slate-600">
                  Your simulated investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Invested</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${portfolioData.totalInvested.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Current Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${portfolioData.totalCurrentValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Gain/Loss</p>
                    <p
                      className={`text-2xl font-bold ${
                        portfolioData.totalGain >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {portfolioData.totalGain >= 0 ? "+" : ""}$
                      {portfolioData.totalGain.toFixed(2)}
                      <span className="text-sm ml-2">
                        ({portfolioData.totalGainPercent.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {portfolioData.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{asset.logo}</span>
                        <div>
                          <p className="font-medium text-slate-900">
                            {asset.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {asset.amount.toFixed(4)} shares @ $
                            {asset.averageBuyPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          ${asset.currentValue.toFixed(2)}
                        </p>
                        <p
                          className={`text-xs ${
                            asset.gain >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {asset.gain >= 0 ? "+" : ""}${asset.gain.toFixed(2)} (
                          {asset.gainPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Balance */}
          <Card className="bg-white border-slate-200 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Available to Invest</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${(balanceData?.balance ?? 0).toFixed(2)} USDC
                  </p>
                </div>
                <svg
                  className="w-12 h-12 text-emerald-600"
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
            </CardContent>
          </Card>

          {/* Asset Directory */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
              Available Assets
            </h2>
            <p className="text-slate-500 mb-6">
              Simulated stocks and crypto for testing. Prices update in real-time.
            </p>

            {assetsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assetsData?.assets.map((asset) => (
                  <Card
                    key={asset.symbol}
                    className="bg-white border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{asset.logo}</span>
                          <div>
                            <CardTitle className="text-lg text-slate-900">
                              {asset.symbol.replace("s", "")}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {asset.name}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          ${asset.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {asset.change24h >= 0 ? (
                            <svg
                              className="w-4 h-4 text-emerald-600"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-rose-600"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M13 17H21M21 17V9M21 17L13 9L9 13L3 7"></path>
                            </svg>
                          )}
                          <span
                            className={`text-sm font-medium ${
                              asset.change24h >= 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {asset.change24h >= 0 ? "+" : ""}
                            {asset.change24h.toFixed(2)}%
                          </span>
                          <span className="text-xs text-slate-500">24h</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleBuyClick(asset.symbol)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                      >
                        Buy {asset.symbol.replace("s", "")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedAssetData?.logo}</span>
              Buy {selectedAssetData?.name}
            </DialogTitle>
            <DialogDescription>
              Current price: ${selectedAssetData?.price.toFixed(2)} per share
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="text-sm font-medium text-slate-700 mb-2 block"
              >
                Amount (USDC)
              </label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="50.00"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="rounded-xl"
              />
              {buyAmount && selectedAssetData && (
                <p className="text-sm text-slate-500 mt-2">
                  You'll receive approximately{" "}
                  <span className="font-medium text-slate-900">
                    {(parseFloat(buyAmount) / selectedAssetData.price).toFixed(4)}
                  </span>{" "}
                  shares
                </p>
              )}
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
                onClick={handleBuySubmit}
                disabled={!buyAmount || buyAsset.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {buyAsset.isPending ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
