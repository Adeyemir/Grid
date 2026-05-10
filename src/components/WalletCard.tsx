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
  onTogglePrivacy?: () => void; // Toggle callback
}

export function WalletCard({
  balance,
  isLoading,
  currency = "USDC",
  className,
  showYieldTicker = true,
  isPrivacyMode = false,
  onTogglePrivacy,
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900">Total Balance</CardTitle>
            <CardDescription className="text-slate-600">
              Your {currency} holdings on Arc Network
            </CardDescription>
          </div>
          {onTogglePrivacy && (
            <button
              onClick={onTogglePrivacy}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title={isPrivacyMode ? "Show balance" : "Hide balance"}
            >
              {isPrivacyMode ? (
                <svg
                  className="w-5 h-5 text-slate-500"
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
                  className="w-5 h-5 text-slate-500"
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
          )}
        </div>
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
