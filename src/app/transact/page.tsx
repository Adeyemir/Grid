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
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { createClient } from "~/lib/supabase/client";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { MobileNav } from "~/components/MobileNav";
import { QRCodeSVG } from "qrcode.react";

export default function TransactPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    authMethod: string;
    web3Address?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("receive");

  // Send form state - Grid User
  const [gridUsername, setGridUsername] = useState("");
  const [gridAmount, setGridAmount] = useState("");
  const [gridNote, setGridNote] = useState("");
  const [resolvedGridUser, setResolvedGridUser] = useState<{
    username: string;
    walletAddress: string;
    email?: string;
  } | null>(null);

  // Send form state - External Wallet
  const [externalAddress, setExternalAddress] = useState("");
  const [externalAmount, setExternalAmount] = useState("");
  const [externalNote, setExternalNote] = useState("");

  // Send form state - Bank (Coming Soon)
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankAmount, setBankAmount] = useState("");

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

  // Determine wallet address
  const displayWalletAddress =
    user?.authMethod === "wallet" ? user.web3Address : undefined;

  // Fetch user's balance
  const { data: balanceData, refetch: refetchBalance } =
    api.wallet.getBalance.useQuery(
      { walletAddress: displayWalletAddress ?? "" },
      { enabled: !!displayWalletAddress },
    );

  // Simulate payroll mutation
  const simulatePayroll = api.wallet.simulatePayroll.useMutation({
    onSuccess: () => {
      toast.success("Paycheck received!", {
        description: "Added $500 USDC to your wallet",
      });
      void refetchBalance();
    },
    onError: (error) => {
      toast.error("Failed to simulate paycheck", {
        description: error.message,
      });
    },
  });


  // Transfer funds mutation
  const transferFunds = api.wallet.transferFunds.useMutation({
    onSuccess: (data) => {
      toast.success("Transfer successful!", {
        description: `Sent $${data.amount.toFixed(2)} USDC`,
      });
      // Clear all form states
      setGridUsername("");
      setGridAmount("");
      setGridNote("");
      setResolvedGridUser(null);
      setExternalAddress("");
      setExternalAmount("");
      setExternalNote("");
      void refetchBalance();
    },
    onError: (error) => {
      toast.error("Transfer failed", {
        description: error.message,
      });
    },
  });

  const handleSimulatePaycheck = () => {
    if (!displayWalletAddress) return;
    simulatePayroll.mutate({
      walletAddress: displayWalletAddress,
      amount: 500,
    });
  };

  // Resolve username - debounced
  useEffect(() => {
    const resolveUser = async () => {
      if (gridUsername && (gridUsername.startsWith("@") || gridUsername.includes("@"))) {
        try {
          const cleanUsername = gridUsername.replace(/^@/, "");
          const response = await fetch(`/api/trpc/wallet.resolveUsername?input=${encodeURIComponent(JSON.stringify({ username: cleanUsername }))}`);
          const data = await response.json();

          if (data.result?.data) {
            setResolvedGridUser({
              username: cleanUsername,
              walletAddress: data.result.data.walletAddress,
              email: data.result.data.email,
            });
            toast.success("User found!", {
              description: `${data.result.data.email}`,
            });
          }
        } catch (error) {
          // Username not found
          setResolvedGridUser(null);
        }
      } else {
        setResolvedGridUser(null);
      }
    };

    const timeoutId = setTimeout(resolveUser, 500);
    return () => clearTimeout(timeoutId);
  }, [gridUsername]);

  // Handle Grid User send
  const handleGridUserSend = () => {
    if (!displayWalletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    if (!resolvedGridUser) {
      toast.error("Please enter a valid Grid username");
      return;
    }

    const amountNum = parseFloat(gridAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount");
      return;
    }

    transferFunds.mutate({
      fromWalletAddress: displayWalletAddress,
      toWalletAddress: resolvedGridUser.walletAddress,
      amount: amountNum,
      note: gridNote || undefined,
    });

    // Clear form on success
    if (transferFunds.isSuccess) {
      setGridUsername("");
      setGridAmount("");
      setGridNote("");
      setResolvedGridUser(null);
    }
  };

  // Handle External Wallet send
  const handleExternalWalletSend = () => {
    if (!displayWalletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    if (!externalAddress || !externalAddress.startsWith("0x") || externalAddress.length !== 42) {
      toast.error("Invalid wallet address");
      return;
    }

    const amountNum = parseFloat(externalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount");
      return;
    }

    transferFunds.mutate({
      fromWalletAddress: displayWalletAddress,
      toWalletAddress: externalAddress,
      amount: amountNum,
      note: externalNote || undefined,
    });

    // Clear form on success
    if (transferFunds.isSuccess) {
      setExternalAddress("");
      setExternalAmount("");
      setExternalNote("");
    }
  };

  // Extract username from email (before @)
  const username = user?.email.split("@")[0] ?? "";

  // Generate mock 10-digit account number from wallet address
  const mockAccountNumber = displayWalletAddress
    ? displayWalletAddress.slice(2, 12).toUpperCase()
    : "";

  const copyAndNotify = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Mock NGN conversion rate (1 USDC = 1,500 NGN)
  const USDC_TO_NGN = 1500;
  const ngnEquivalent = bankAmount ? (parseFloat(bankAmount) * USDC_TO_NGN).toFixed(2) : "0.00";

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
        <div className="container mx-auto px-4 py-16 max-w-full">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
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
              <span className="text-emerald-600">Grid</span> Transact
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-slate-300 hover:bg-slate-50 rounded-lg sm:rounded-xl text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap flex-shrink-0"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-16 max-w-full">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 w-full">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl shadow-lg w-full max-w-full overflow-hidden">
            <CardContent className="pt-6 px-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-500">Available Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                    ${(balanceData?.balance ?? 0).toFixed(2)} USDC
                  </p>
                </div>
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 flex-shrink-0"
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl max-w-full">
              <TabsTrigger
                value="receive"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
              >
                Receive
              </TabsTrigger>
              <TabsTrigger
                value="send"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
              >
                Send
              </TabsTrigger>
            </TabsList>

            {/* Receive Tab */}
            <TabsContent value="receive" className="space-y-4 sm:space-y-6 mt-6 w-full">
              {/* 1. Stablecoin Section */}
              <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl shadow-sm w-full max-w-full overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-slate-900 text-base sm:text-lg">Receive USDC</CardTitle>
                      <CardDescription className="text-slate-600 text-sm">
                        Receive stablecoins from any crypto wallet
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  {/* QR Code */}
                  <div className="flex justify-center p-6 bg-white rounded-xl border border-emerald-100">
                    {displayWalletAddress && (
                      <QRCodeSVG
                        value={displayWalletAddress}
                        size={180}
                        level="H"
                        includeMargin={true}
                        fgColor="#059669"
                      />
                    )}
                  </div>

                  {/* Wallet Address */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Wallet Address
                    </p>
                    <p className="font-mono text-xs text-slate-900 break-all mb-3">
                      {displayWalletAddress}
                    </p>
                    <Button
                      onClick={() => copyAndNotify(displayWalletAddress ?? "", "Address")}
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
                        <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      Copy Address
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Local Currency Section */}
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 rounded-xl shadow-sm w-full max-w-full overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-slate-900 text-base sm:text-lg">
                          Receive Naira (NGN)
                        </CardTitle>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          Coming Soon
                        </span>
                      </div>
                      <CardDescription className="text-slate-600 text-sm">
                        Receive fiat via local bank transfer
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Bank Name</span>
                      <span className="text-sm font-semibold text-slate-900">
                        Arc Bank (Virtual)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 font-mono">
                          {mockAccountNumber}
                        </span>
                        <button
                          onClick={() => copyAndNotify(mockAccountNumber, "Account number")}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <svg
                            className="w-4 h-4 text-slate-500"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500 flex-shrink-0">Account Name</span>
                      <span className="text-sm font-semibold text-slate-900 break-all text-right ml-2">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700 text-center">
                      💡 In production, this will connect to local payment providers for instant fiat-to-crypto conversion
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Grid Username Section */}
              <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-200 rounded-xl shadow-sm w-full max-w-full overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-slate-900 text-base sm:text-lg">
                        Receive from Grid Users
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-sm">
                        Share your username to receive instantly
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-violet-200 text-center">
                    <p className="text-sm text-slate-500 mb-2">Your Grid Username</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-violet-600 mb-4 break-all px-2">
                      @{username}
                    </p>
                    <p className="text-xs text-slate-600 mb-4">
                      Other Grid users can send you USDC using just your username
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyAndNotify(`@${username}`, "Username")}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
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
                          <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                        </svg>
                        Copy Username
                      </Button>
                      <Button
                        onClick={() => {
                          const text = `Send me USDC on Grid! My username: @${username}`;
                          void navigator.clipboard.writeText(text);
                          toast.success("Share text copied!");
                        }}
                        variant="outline"
                        className="flex-1 border-violet-600 text-violet-600 hover:bg-violet-50 rounded-xl"
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
                          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Faucet - Less Prominent */}
              <div className="pt-4">
                <Button
                  onClick={handleSimulatePaycheck}
                  disabled={simulatePayroll.isPending}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl py-3"
                >
                  {simulatePayroll.isPending ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                      </svg>
                      <span className="text-sm">Test Faucet: Add $500 USDC</span>
                    </div>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Send Tab */}
            <TabsContent value="send" className="space-y-4 sm:space-y-6 mt-6 w-full">
              {/* 1. Send to Grid User (PRIMARY) */}
              <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-200 rounded-xl shadow-sm w-full max-w-full overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-slate-900 text-base sm:text-lg">Send to Grid User</CardTitle>
                      <CardDescription className="text-slate-600 text-sm">
                        Instant free transfers to other Grid users
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  {/* Username Input */}
                  <div>
                    <label
                      htmlFor="grid-username"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Recipient Username
                    </label>
                    <Input
                      id="grid-username"
                      type="text"
                      placeholder="@username or email"
                      value={gridUsername}
                      onChange={(e) => setGridUsername(e.target.value)}
                      className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                    {resolvedGridUser && (
                      <div className="mt-2 p-2 bg-violet-50 rounded-lg border border-violet-200">
                        <p className="text-xs text-violet-700 flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          User found: {resolvedGridUser.email}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label
                      htmlFor="grid-amount"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Amount (USDC)
                    </label>
                    <Input
                      id="grid-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="10.00"
                      value={gridAmount}
                      onChange={(e) => setGridAmount(e.target.value)}
                      className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label
                      htmlFor="grid-note"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Note (Optional)
                    </label>
                    <Input
                      id="grid-note"
                      type="text"
                      placeholder="What's this for?"
                      value={gridNote}
                      onChange={(e) => setGridNote(e.target.value)}
                      className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleGridUserSend}
                    disabled={transferFunds.isPending || !resolvedGridUser || !gridAmount}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 rounded-xl font-semibold"
                  >
                    {transferFunds.isPending ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                        Send to @{resolvedGridUser?.username ?? "User"}
                      </div>
                    )}
                  </Button>

                  <div className="bg-violet-50 p-3 rounded-xl border border-violet-100">
                    <p className="text-xs text-violet-700 text-center">
                      ⚡ Instant and free! No blockchain fees between Grid users
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Send to External Wallet */}
              <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl shadow-sm w-full max-w-full overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-slate-900 text-base sm:text-lg">
                        Send to External Wallet
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-sm">
                        Send USDC to any crypto wallet address
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  {/* Wallet Address Input */}
                  <div>
                    <label
                      htmlFor="external-address"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Wallet Address
                    </label>
                    <Input
                      id="external-address"
                      type="text"
                      placeholder="0x..."
                      value={externalAddress}
                      onChange={(e) => setExternalAddress(e.target.value)}
                      className="rounded-xl font-mono text-sm border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    {externalAddress && externalAddress.startsWith("0x") && externalAddress.length === 42 && (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Valid wallet address
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label
                      htmlFor="external-amount"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Amount (USDC)
                    </label>
                    <Input
                      id="external-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="10.00"
                      value={externalAmount}
                      onChange={(e) => setExternalAmount(e.target.value)}
                      className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label
                      htmlFor="external-note"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Note (Optional)
                    </label>
                    <Input
                      id="external-note"
                      type="text"
                      placeholder="What's this for?"
                      value={externalNote}
                      onChange={(e) => setExternalNote(e.target.value)}
                      className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleExternalWalletSend}
                    disabled={
                      transferFunds.isPending ||
                      !externalAddress ||
                      !externalAddress.startsWith("0x") ||
                      externalAddress.length !== 42 ||
                      !externalAmount
                    }
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-semibold"
                  >
                    {transferFunds.isPending ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                        Send USDC
                      </div>
                    )}
                  </Button>

                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-700 text-center">
                      💡 On-chain transfer using Circle Programmable Wallets SDK
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Send to Bank Account (Coming Soon) */}
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 rounded-xl shadow-sm relative overflow-hidden w-full max-w-full">
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-semibold mb-2">
                      Coming Soon
                    </div>
                    <p className="text-sm text-slate-600 max-w-xs mx-auto">
                      Direct bank transfers will be available soon
                    </p>
                  </div>
                </div>

                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-slate-900 text-base sm:text-lg">
                        Send to Bank (NGN)
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-sm">
                        Send funds directly to a Nigerian bank account
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 opacity-50 px-4 sm:px-6">
                  {/* Bank Name */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Bank Name
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-blue-200 rounded-xl bg-white text-slate-900"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      disabled
                    >
                      <option value="">Select bank...</option>
                      <option value="access">Access Bank</option>
                      <option value="gtb">GTBank</option>
                      <option value="zenith">Zenith Bank</option>
                      <option value="uba">UBA</option>
                      <option value="firstbank">First Bank</option>
                    </select>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Account Number
                    </label>
                    <Input
                      type="text"
                      placeholder="0123456789"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="rounded-xl font-mono border-blue-200"
                      disabled
                    />
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Account Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Will auto-populate"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="rounded-xl border-blue-200"
                      disabled
                    />
                  </div>

                  {/* Amount with Conversion */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Amount (USDC)
                    </label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="10.00"
                      value={bankAmount}
                      onChange={(e) => setBankAmount(e.target.value)}
                      className="rounded-xl border-blue-200"
                      disabled
                    />
                    {bankAmount && (
                      <p className="text-xs text-blue-600 mt-2">
                        ≈ ₦{ngnEquivalent} NGN (Rate: 1 USDC = ₦{USDC_TO_NGN.toLocaleString()})
                      </p>
                    )}
                  </div>

                  {/* Send Button */}
                  <Button
                    disabled
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                      </svg>
                      Send to Bank
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
