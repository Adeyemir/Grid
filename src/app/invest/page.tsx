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
import { useGridAuth } from "~/hooks/useGridAuth";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { MobileNav } from "~/components/MobileNav";
import { Car, Apple, Bitcoin, Coins, TrendingUp, Search, DollarSign, CheckCircle2, ArrowDownRight, ArrowUpRight, Share2 } from "lucide-react";

// Receipt type for transactions
interface TransactionReceipt {
  transactionId: string;
  reference: string;
  type: "BUY" | "SELL";
  asset: string;
  assetName: string;
  shares: number;
  pricePerShare: number;
  totalCost?: number;
  totalProceeds?: number;
  costBasis?: number;
  profitLoss?: number;
  network: string;
  timestamp: string;
}

// Professional icon mapping for assets
const AssetIcon = ({ symbol, className }: { symbol: string; className?: string }) => {
  const iconClass = className ?? "w-8 h-8";

  switch (symbol) {
    case "sTSLA":
      return <div className={`${iconClass} rounded-full bg-red-100 flex items-center justify-center`}><Car className="w-5 h-5 text-red-600" /></div>;
    case "sAAPL":
      return <div className={`${iconClass} rounded-full bg-slate-100 flex items-center justify-center`}><Apple className="w-5 h-5 text-slate-700" /></div>;
    case "sBTC":
      return <div className={`${iconClass} rounded-full bg-orange-100 flex items-center justify-center`}><Bitcoin className="w-5 h-5 text-orange-500" /></div>;
    case "sETH":
      return <div className={`${iconClass} rounded-full bg-indigo-100 flex items-center justify-center`}><Coins className="w-5 h-5 text-indigo-600" /></div>;
    case "sSPY":
      return <div className={`${iconClass} rounded-full bg-emerald-100 flex items-center justify-center`}><TrendingUp className="w-5 h-5 text-emerald-600" /></div>;
    case "sGOOG":
      return <div className={`${iconClass} rounded-full bg-blue-100 flex items-center justify-center`}><Search className="w-5 h-5 text-blue-600" /></div>;
    default:
      return <div className={`${iconClass} rounded-full bg-slate-100 flex items-center justify-center`}><DollarSign className="w-5 h-5 text-slate-600" /></div>;
  }
};

export default function InvestPage() {
  const router = useRouter();
  const { user, ready, isAuthenticated, walletAddress } = useGridAuth();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [sellAssetSymbol, setSellAssetSymbol] = useState<string | null>(null);
  const [sellAmount, setSellAmount] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push("/login");
    }
  }, [ready, isAuthenticated, router]);

  // Fetch available assets
  const { data: assetsData, isLoading: assetsLoading } =
    api.invest.getAssets.useQuery();

  // Use Privy wallet address
  const displayWalletAddress = walletAddress;
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
      setSelectedAsset(null);
      setBuyAmount("");
      setReceipt({
        ...data.receipt,
        type: "BUY" as const,
      });
      void refetchPortfolio();
    },
    onError: (error) => {
      toast.error("Purchase failed", {
        description: error.message,
      });
    },
  });

  // Sell asset mutation
  const sellAsset = api.invest.sellAsset.useMutation({
    onSuccess: (data) => {
      setSellAssetSymbol(null);
      setSellAmount("");
      setReceipt({
        ...data.receipt,
        type: "SELL" as const,
      });
      void refetchPortfolio();
    },
    onError: (error) => {
      toast.error("Sale failed", {
        description: error.message,
      });
    },
  });

  // Get asset to sell details
  const sellAssetData = portfolioData?.assets.find(
    (a) => a.symbol === sellAssetSymbol,
  );

  const handleSellSubmit = () => {
    if (!user || !displayWalletAddress || !sellAssetSymbol || !sellAmount) {
      return;
    }

    const shares = parseFloat(sellAmount);
    if (isNaN(shares) || shares <= 0) {
      toast.error("Invalid amount");
      return;
    }

    sellAsset.mutate({
      walletAddress: displayWalletAddress,
      userId: user.id,
      symbol: sellAssetSymbol,
      sharesToSell: shares,
    });
  };

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

  if (!ready || !isAuthenticated) {
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
                        <AssetIcon symbol={asset.symbol} className="w-10 h-10" />
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
                      <div className="flex items-center gap-3">
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSellAssetSymbol(asset.symbol)}
                          className="border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          Sell
                        </Button>
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
                        <div className="flex items-center gap-3">
                          <AssetIcon symbol={asset.symbol} className="w-12 h-12" />
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
            <DialogTitle className="flex items-center gap-3">
              {selectedAssetData && <AssetIcon symbol={selectedAssetData.symbol} className="w-10 h-10" />}
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

      {/* Sell Modal */}
      <Dialog open={!!sellAssetSymbol} onOpenChange={() => setSellAssetSymbol(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {sellAssetData && <AssetIcon symbol={sellAssetData.symbol} className="w-10 h-10" />}
              Sell {sellAssetData?.name}
            </DialogTitle>
            <DialogDescription>
              Current price: ${sellAssetData?.currentPrice.toFixed(2)} per share
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {sellAssetData && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Your Holdings</p>
                <p className="font-medium text-slate-900">
                  {sellAssetData.amount.toFixed(4)} shares (${sellAssetData.currentValue.toFixed(2)})
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="sellAmount"
                className="text-sm font-medium text-slate-700 mb-2 block"
              >
                Shares to Sell
              </label>
              <Input
                id="sellAmount"
                type="number"
                min="0.0001"
                step="0.0001"
                placeholder="0.5000"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="rounded-xl"
              />
              {sellAmount && sellAssetData && (
                <p className="text-sm text-slate-500 mt-2">
                  You'll receive approximately{" "}
                  <span className="font-medium text-emerald-600">
                    ${(parseFloat(sellAmount) * sellAssetData.currentPrice).toFixed(2)} USDC
                  </span>
                </p>
              )}
              {sellAssetData && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSellAmount(sellAssetData.amount.toString())}
                  className="text-xs text-emerald-600 p-0 h-auto mt-1"
                >
                  Sell All
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSellAssetSymbol(null)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSellSubmit}
                disabled={!sellAmount || sellAsset.isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              >
                {sellAsset.isPending ? "Processing..." : "Confirm Sale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Receipt Modal */}
      <Dialog open={!!receipt} onOpenChange={() => setReceipt(null)}>
        <DialogContent className="rounded-xl max-w-md">
          <div className="text-center py-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              receipt?.type === "BUY" ? "bg-emerald-100" : "bg-blue-100"
            }`}>
              <CheckCircle2 className={`w-8 h-8 ${
                receipt?.type === "BUY" ? "text-emerald-600" : "text-blue-600"
              }`} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {receipt?.type === "BUY" ? "Purchase Successful" : "Sale Successful"}
            </h2>
            <p className="text-sm text-slate-500">Transaction confirmed on {receipt?.network}</p>
          </div>

          {receipt && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Reference</span>
                <span className="font-mono text-sm font-medium text-slate-900">{receipt.reference}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Asset</span>
                <div className="flex items-center gap-2">
                  <AssetIcon symbol={receipt.asset} className="w-6 h-6" />
                  <span className="font-medium text-slate-900">{receipt.assetName}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Shares</span>
                <div className="flex items-center gap-1">
                  {receipt.type === "BUY" ? (
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="font-medium text-slate-900">{receipt.shares.toFixed(4)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Price per Share</span>
                <span className="font-medium text-slate-900">${receipt.pricePerShare.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">
                    {receipt.type === "BUY" ? "Total Cost" : "Total Proceeds"}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    ${(receipt.totalCost ?? receipt.totalProceeds ?? 0).toFixed(2)} USDC
                  </span>
                </div>
              </div>

              {receipt.type === "SELL" && receipt.profitLoss !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Profit/Loss</span>
                  <span className={`font-medium ${receipt.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {receipt.profitLoss >= 0 ? "+" : ""}${receipt.profitLoss.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Time</span>
                <span className="text-sm text-slate-900">
                  {new Date(receipt.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => {
                if (!receipt) return;
                const shareText = `Grid Investment Receipt\n\n${receipt.type === "BUY" ? "Purchased" : "Sold"} ${receipt.shares.toFixed(4)} ${receipt.assetName}\nPrice: $${receipt.pricePerShare.toFixed(2)}/share\n${receipt.type === "BUY" ? "Total Cost" : "Total Proceeds"}: $${(receipt.totalCost ?? receipt.totalProceeds ?? 0).toFixed(2)} USDC\nRef: ${receipt.reference}\nNetwork: ${receipt.network}\nTime: ${new Date(receipt.timestamp).toLocaleString()}`;

                if (navigator.share) {
                  void navigator.share({
                    title: `Grid ${receipt.type === "BUY" ? "Purchase" : "Sale"} Receipt`,
                    text: shareText,
                  });
                } else {
                  void navigator.clipboard.writeText(shareText);
                  toast.success("Receipt copied to clipboard!");
                }
              }}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => setReceipt(null)}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
