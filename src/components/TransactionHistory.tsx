"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { TransactionReceipt } from "./TransactionReceipt";

interface TransactionHistoryProps {
  walletAddress: string;
  limit?: number;
  showViewAll?: boolean;
  showFilters?: boolean;
  className?: string;
}

type TransactionType = "all" | "send" | "receive" | "investment" | "bill_pay" | "payroll";

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: number;
  symbol?: string | null;
  status: string;
  description?: string | null;
  recipient?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export function TransactionHistory({
  walletAddress,
  limit = 5,
  showViewAll = true,
  showFilters = false,
  className = "",
}: TransactionHistoryProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<TransactionType>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { data, isLoading } = api.wallet.getAllTransactions.useQuery(
    {
      walletAddress,
      limit,
      type: filter,
    },
    {
      enabled: !!walletAddress,
    },
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "investment": return "📈";
      case "bill_pay": return "📄";
      case "send": return "↗️";
      case "receive": return "↙️";
      case "payroll": return "💰";
      default: return "💳";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "investment": return "Investment";
      case "bill_pay": return "Bill Payment";
      case "send": return "Sent";
      case "receive": return "Received";
      case "payroll": return "Payroll";
      default: return type;
    }
  };

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsReceiptOpen(true);
  };

  const filters: { value: TransactionType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "send", label: "Sends" },
    { value: "receive", label: "Receives" },
    { value: "investment", label: "Investments" },
    { value: "bill_pay", label: "Bills" },
  ];

  if (isLoading) {
    return (
      <Card className={`bg-white border-slate-200 rounded-xl ${className}`}>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg text-slate-900">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = data?.transactions ?? [];

  return (
    <>
      <Card className={`bg-white border-slate-200 rounded-xl ${className}`}>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-900">Recent Transactions</CardTitle>
            {showViewAll && transactions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/transactions")}
                className="text-slate-600 hover:text-slate-900"
              >
                View All
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7"></path>
                </svg>
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {filters.map((f) => (
                <Button
                  key={f.value}
                  variant={filter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.value)}
                  className={`rounded-lg text-xs ${
                    filter === f.value
                      ? "bg-black text-white"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No transactions yet</p>
              <p className="text-slate-400 text-xs mt-1">
                Your transactions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isOutgoing =
                  tx.amount < 0 || ["investment", "bill_pay", "send"].includes(tx.type);
                const displayAmount = Math.abs(tx.amount);

                return (
                  <div
                    key={tx.id}
                    onClick={() => handleTransactionClick(tx)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTypeIcon(tx.type)}</span>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {tx.description ?? getTypeLabel(tx.type)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString()} • {tx.reference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          isOutgoing ? "text-slate-900" : "text-green-600"
                        }`}
                      >
                        {isOutgoing ? "-" : "+"}${displayAmount.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs ${
                          tx.status === "confirmed"
                            ? "text-green-600"
                            : tx.status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.status === "confirmed" && "✓ "}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionReceipt
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </>
  );
}
