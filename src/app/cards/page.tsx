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
import { createClient } from "~/lib/supabase/client";
import { MobileNav } from "~/components/MobileNav";

export default function CardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    authMethod: string;
    web3Address?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  // Mock card data (Story 5.2)
  const cardData = {
    cardNumber: "4532 1234 5678 4242",
    cardholderName: user?.email?.split("@")[0]?.toUpperCase() ?? "GRID USER",
    expiryDate: "12/27",
    cvv: "123",
    network: "VISA",
  };

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

      const authMethod = supabaseUser.user_metadata?.auth_method as
        | string
        | undefined;
      const web3WalletAddress = supabaseUser.user_metadata
        ?.wallet_address as string | undefined;

      setUser({
        email: supabaseUser.email ?? "",
        authMethod: authMethod ?? "email",
        web3Address: web3WalletAddress,
      });
      setLoading(false);
    }

    void getUser();
  }, [router]);

  const maskCardNumber = (number: string) => {
    const parts = number.split(" ");
    return `•••• •••• •••• ${parts[3]}`;
  };

  const maskCVV = () => "•••";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64 w-full max-w-md mx-auto" />
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
              <span className="text-emerald-600">Grid</span> Card
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
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Card Preview */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {/* Virtual Card */}
              <div className="relative aspect-[1.586/1] w-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-2xl shadow-2xl p-8 text-white">
                {/* Card Network Logo */}
                <div className="flex justify-between items-start mb-8">
                  <div className="text-2xl font-bold tracking-wider">GRID</div>
                  <div className="text-xl font-bold">VISA</div>
                </div>

                {/* Chip */}
                <div className="mb-8">
                  <div className="w-14 h-11 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-lg"></div>
                </div>

                {/* Card Number */}
                <div className="mb-6">
                  <p className="text-2xl font-mono tracking-wider">
                    {isRevealed
                      ? cardData.cardNumber
                      : maskCardNumber(cardData.cardNumber)}
                  </p>
                </div>

                {/* Card Details */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-75 mb-1">CARDHOLDER</p>
                    <p className="text-sm font-medium tracking-wide">
                      {cardData.cardholderName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75 mb-1">EXPIRES</p>
                    <p className="text-sm font-medium">
                      {isRevealed ? cardData.expiryDate : "••/••"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75 mb-1">CVV</p>
                    <p className="text-sm font-medium">
                      {isRevealed ? cardData.cvv : maskCVV()}
                    </p>
                  </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-24 -mb-24"></div>
              </div>
            </div>
          </div>

          {/* Card Actions */}
          <Card className="bg-white border-slate-200 rounded-xl">
            <CardHeader>
              <CardTitle className="text-slate-900">Card Details</CardTitle>
              <CardDescription className="text-slate-600">
                Your virtual Grid Visa card for online purchases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setIsRevealed(!isRevealed)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {isRevealed ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                    Hide Details
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
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
                    Reveal Details
                  </>
                )}
              </Button>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Card Type</span>
                  <span className="font-medium text-slate-900">Virtual Visa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Network</span>
                  <span className="font-medium text-slate-900">Tempo Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium text-emerald-600 flex items-center gap-1">
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
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-emerald-50 border-emerald-200 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-sm text-emerald-900">
                  <p className="font-semibold mb-1">Virtual Card Information</p>
                  <p>
                    This is a simulated virtual card for the Grid prototype. In
                    production, this would connect to a real card issuance API and
                    allow you to shop online with your USDC balance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-slate-200 rounded-xl hover:shadow-md transition-shadow cursor-not-allowed opacity-60">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-slate-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Freeze Card</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-xl hover:shadow-md transition-shadow cursor-not-allowed opacity-60">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-slate-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    Transaction History
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
