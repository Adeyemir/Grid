"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { MobileNav } from "~/components/MobileNav";
import { TransactionReceipt } from "~/components/TransactionReceipt";
import { useCreateWallet } from "~/hooks/useCreateWallet";
import { useGridAuth } from "~/hooks/useGridAuth";
import { api } from "~/trpc/react";

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

export default function TransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TransactionType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { walletAddress } = useCreateWallet();
  const { ready, isAuthenticated } = useGridAuth();

  const { data, isLoading } = api.wallet.getAllTransactions.useQuery(
    {
      walletAddress: walletAddress ?? "",
      limit: 50,
      type: filter,
    },
    {
      enabled: !!walletAddress,
    },
  );

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    setLoading(false);
  }, [ready, isAuthenticated, router]);

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

  // Filter transactions by search query
  const transactions = (data?.transactions ?? []).filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.reference.toLowerCase().includes(query) ||
      tx.description?.toLowerCase().includes(query) ||
      tx.recipient?.toLowerCase().includes(query) ||
      tx.type.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
              Transactions
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
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search & Filters */}
          <Card className="bg-white border-slate-200 rounded-xl">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <Input
                    type="text"
                    placeholder="Search by reference, description, or recipient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {filters.map((f) => (
                    <Button
                      key={f.value}
                      variant={filter === f.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f.value)}
                      className={`rounded-lg ${
                        filter === f.value
                          ? "bg-black text-white"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card className="bg-white border-slate-200 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">
                {filter === "all" ? "All Transactions" : `${filters.find(f => f.value === filter)?.label}`}
                <span className="text-sm text-slate-500 font-normal ml-2">
                  ({transactions.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-slate-500">No transactions found</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {searchQuery
                      ? "Try a different search term"
                      : "Your transactions will appear here"}
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
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-slate-200">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {tx.description ?? getTypeLabel(tx.type)}
                            </p>
                            <p className="text-xs text-slate-500" suppressHydrationWarning>
                              {new Date(tx.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              {tx.reference}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              isOutgoing ? "text-slate-900" : "text-green-600"
                            }`}
                          >
                            {isOutgoing ? "-" : "+"}${displayAmount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : tx.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tx.status === "confirmed" && "✓ "}
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      <TransactionReceipt
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />

      {/* Mobile Navigation */}
      <MobileNav />
    </main>
  );
}
