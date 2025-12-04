"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface WalletCardProps {
  balance: number;
  isLoading: boolean;
  currency?: string;
  className?: string;
  showYieldTicker?: boolean; // Enable the "Grow" visualization
  isPrivacyMode?: boolean; // Epic 6: Privacy toggle
}

export function WalletCard({
  balance,
  isLoading,
  currency = "USDC",
  className,
  showYieldTicker = true,
  isPrivacyMode = false,
}: WalletCardProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [previousBalance, setPreviousBalance] = useState(balance);
  const [yieldEarned, setYieldEarned] = useState(0);

  // Trigger flash animation when balance increases
  useEffect(() => {
    if (balance > previousBalance && previousBalance > 0) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1000);
      return () => clearTimeout(timer);
    }
    setPreviousBalance(balance);
  }, [balance, previousBalance]);

  // Yield Ticker Animation (Story 4.1: The Pulse)
  // Simulates 5% APY by incrementing a tiny amount every 3 seconds
  useEffect(() => {
    if (!showYieldTicker || balance === 0) return;

    const interval = setInterval(() => {
      // Calculate yield increment based on 5% APY
      // APY 5% = 0.05 per year
      // Per 3 seconds = 0.05 / (365 * 24 * 60 * 60 / 3)
      const yearInSeconds = 365 * 24 * 60 * 60;
      const intervalsPerYear = yearInSeconds / 3;
      const incrementRate = 0.05 / intervalsPerYear;
      const yieldIncrement = balance * incrementRate;

      setYieldEarned((prev) => prev + yieldIncrement);
    }, 3000);

    return () => clearInterval(interval);
  }, [balance, showYieldTicker]);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl shadow-lg transition-all duration-500",
        isFlashing && "ring-4 ring-emerald-400 shadow-emerald-200",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-slate-900">Total Balance</CardTitle>
        <CardDescription className="text-slate-600">
          Your {currency} holdings on Arc Network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-64" />
        ) : (
          <div
            className={cn(
              "transition-all duration-300",
              isFlashing && "scale-105",
            )}
          >
            <div className={cn(
              "text-5xl font-bold text-slate-900 tabular-nums tracking-tight",
              isPrivacyMode && "blur-md select-none"
            )}>
              ${formatBalance(balance)}{" "}
              <span className="text-2xl text-slate-500 font-normal">
                {currency}
              </span>
            </div>

            {balance === 0 ? (
              <p className="text-sm text-slate-500 mt-3">
                Ready to receive your first payment
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-emerald-600 mt-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  <span className="font-medium">Funds available</span>
                </div>

                {showYieldTicker && yieldEarned > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-emerald-600"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-xs font-medium text-slate-600">
                          Yield Earned (5% APY)
                        </span>
                      </div>
                      <span className={cn(
                        "text-sm font-bold text-emerald-600 tabular-nums",
                        isPrivacyMode && "blur-md select-none"
                      )}>
                        +${formatBalance(yieldEarned)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
