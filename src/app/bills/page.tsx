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
import { Smartphone, Phone, Zap, Tv, Receipt, Share2 } from "lucide-react";

// Professional icon mapping for bill providers
const ProviderIcon = ({ providerId, className }: { providerId: string; className?: string }) => {
  const iconClass = className ?? "w-12 h-12";

  switch (providerId) {
    case "mtn-data":
      return <div className={`${iconClass} rounded-xl bg-yellow-100 flex items-center justify-center`}><Smartphone className="w-6 h-6 text-yellow-600" /></div>;
    case "airtel-airtime":
      return <div className={`${iconClass} rounded-xl bg-red-100 flex items-center justify-center`}><Phone className="w-6 h-6 text-red-600" /></div>;
    case "ikeja-electric":
      return <div className={`${iconClass} rounded-xl bg-amber-100 flex items-center justify-center`}><Zap className="w-6 h-6 text-amber-600" /></div>;
    case "dstv":
      return <div className={`${iconClass} rounded-xl bg-blue-100 flex items-center justify-center`}><Tv className="w-6 h-6 text-blue-600" /></div>;
    default:
      return <div className={`${iconClass} rounded-xl bg-slate-100 flex items-center justify-center`}><Receipt className="w-6 h-6 text-slate-600" /></div>;
  }
};

export default function BillsPage() {
  const router = useRouter();
  const { user, ready, isAuthenticated, walletAddress } = useGridAuth();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push("/login");
    }
  }, [ready, isAuthenticated, router]);

  // Use Privy wallet address
  const displayWalletAddress = walletAddress;

  // Fetch providers
  const { data: providersData, isLoading: providersLoading } =
    api.spend.getProviders.useQuery();

  // Fetch user's balance
  const { data: balanceData, refetch: refetchBalance } =
    api.wallet.getBalance.useQuery(
      { walletAddress: displayWalletAddress ?? "" },
      { enabled: !!displayWalletAddress },
    );

  // Fetch spending history
  const { data: historyData, refetch: refetchHistory } =
    api.spend.getSpendingHistory.useQuery(
      { walletAddress: displayWalletAddress ?? "" },
      { enabled: !!displayWalletAddress },
    );

  // Pay bill mutation
  const payBill = api.spend.payBill.useMutation({
    onSuccess: (data) => {
      toast.success(`Payment successful!`, {
        description: `Paid ${data.provider} - $${data.amount.toFixed(2)} USDC`,
      });
      setReceipt(data.receipt);
      setShowReceipt(true);
      setSelectedProvider(null);
      setFormData({});
      void refetchBalance();
      void refetchHistory();
    },
    onError: (error) => {
      toast.error("Payment failed", {
        description: error.message,
      });
    },
  });

  const selectedProviderData = providersData?.providers.find(
    (p) => p.id === selectedProvider,
  );

  const handleProviderClick = (providerId: string) => {
    console.log("Provider clicked:", providerId);
    setSelectedProvider(providerId);
    setFormData({});
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handlePaymentSubmit = () => {
    console.log("Pay button clicked");
    if (!user || !displayWalletAddress || !selectedProvider) {
      console.log("Missing required data:", { user, displayWalletAddress, selectedProvider });
      return;
    }

    const amount = parseFloat(formData.amount ?? "0");
    if (isNaN(amount) || amount <= 0) {
      console.log("Invalid amount:", amount);
      toast.error("Invalid amount");
      return;
    }

    // Validate required fields
    const provider = selectedProviderData;
    if (!provider) {
      console.log("Provider not found");
      return;
    }

    const missingFields = provider.fields.filter(
      (field) => !formData[field.name] || formData[field.name]?.trim() === "",
    );

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      toast.error("Please fill in all fields");
      return;
    }

    console.log("Executing pay bill mutation:", {
      walletAddress: displayWalletAddress,
      userId: user.id,
      providerId: selectedProvider,
      amount,
      currentBalance: balanceData?.balance ?? 0,
      metadata: formData,
    });

    payBill.mutate({
      walletAddress: displayWalletAddress,
      userId: user.id,
      providerId: selectedProvider,
      amount,
      currentBalance: balanceData?.balance ?? 0,
      metadata: formData,
    });
  };

  if (!ready || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
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
              <span className="text-emerald-600">Grid</span> Bills
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
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Available Balance</p>
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
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          {historyData && historyData.transactions.length > 0 && (
            <Card className="bg-white border-slate-200 rounded-xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Payments</CardTitle>
                <CardDescription className="text-slate-600">
                  Total spent: ${historyData.totalSpent.toFixed(2)} USDC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {historyData.transactions.slice(0, 5).map((tx) => {
                    const metadata = tx.metadata
                      ? JSON.parse(tx.metadata)
                      : {};
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {tx.description}
                          </p>
                          <p className="text-xs text-slate-500" suppressHydrationWarning>
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-medium text-rose-600">
                          -${Math.abs(tx.amount).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bill Providers */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
              Pay Your Bills
            </h2>
            <p className="text-slate-500 mb-6">
              Pay bills instantly with USDC. No delays, no hassle.
            </p>

            {providersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providersData?.providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className="bg-white border-slate-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProviderClick(provider.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <ProviderIcon providerId={provider.id} className="w-14 h-14" />
                        <div>
                          <CardTitle className="text-lg text-slate-900">
                            {provider.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {provider.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        Pay Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog
        open={!!selectedProvider}
        onOpenChange={() => setSelectedProvider(null)}
      >
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedProviderData && <ProviderIcon providerId={selectedProviderData.id} className="w-12 h-12" />}
              Pay {selectedProviderData?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedProviderData?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedProviderData?.fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-slate-700 mb-2 block"
                >
                  {field.label}
                </label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="rounded-xl"
                />
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedProvider(null)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={payBill.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {payBill.isPending ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Payment Successful!
            </DialogTitle>
          </DialogHeader>

          {receipt && (
            <div className="space-y-4">
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-center">
                  <ProviderIcon providerId={receipt.providerId} className="w-20 h-20" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">Paid to</p>
                  <p className="text-xl font-bold text-slate-900">
                    {receipt.providerName}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600">
                    ${receipt.amount.toFixed(2)} USDC
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-mono text-slate-900">
                    {receipt.reference.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Network</span>
                  <span className="font-medium text-slate-900">
                    {receipt.network}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(receipt.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!receipt) return;
                    const shareText = `Grid Bill Payment Receipt\n\nPaid to: ${receipt.providerName}\nAmount: $${receipt.amount.toFixed(2)} USDC\nReference: ${receipt.reference}\nNetwork: ${receipt.network}\nDate: ${new Date(receipt.timestamp).toLocaleString()}`;

                    if (navigator.share) {
                      void navigator.share({
                        title: "Grid Bill Payment Receipt",
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
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
