"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { MobileNav } from "~/components/MobileNav";

export default function WalletImportPage() {
  const router = useRouter();
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleSeedPhraseImport = async () => {
    const words = seedPhrase.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      toast.error("Invalid seed phrase", {
        description: "Seed phrase must be 12 or 24 words",
      });
      return;
    }

    setIsImporting(true);
    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Wallet imported successfully!", {
      description: "Your wallet has been securely imported",
    });

    setIsImporting(false);
    router.push("/portfolio");
  };

  const handlePrivateKeyImport = async () => {
    if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
      toast.error("Invalid private key", {
        description: "Private key must start with 0x and be 64 characters",
      });
      return;
    }

    setIsImporting(true);
    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Wallet imported successfully!", {
      description: "Your wallet has been securely imported",
    });

    setIsImporting(false);
    router.push("/portfolio");
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20 sm:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-emerald-600">Grid</span> Wallet Import
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
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Info Banner */}
          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Security Notice
                  </h3>
                  <p className="text-sm text-amber-700">
                    Never share your seed phrase or private key with anyone. Grid
                    will never ask for this information. Imported wallets are
                    stored locally on your device.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Options */}
          <Tabs defaultValue="walletconnect" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger
                value="walletconnect"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
              >
                WalletConnect
              </TabsTrigger>
              <TabsTrigger
                value="seed"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
              >
                Seed Phrase
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
              >
                Private Key
              </TabsTrigger>
            </TabsList>

            {/* WalletConnect Tab */}
            <TabsContent value="walletconnect" className="mt-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 rounded-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-slate-900">
                        Connect Existing Wallet
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Connect MetaMask, Rainbow, Trust Wallet, and more
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "MetaMask", icon: "🦊" },
                      { name: "Rainbow", icon: "🌈" },
                      { name: "Trust Wallet", icon: "🛡️" },
                      { name: "Coinbase", icon: "🔷" },
                    ].map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => {
                          toast.info(`Connecting to ${wallet.name}...`);
                          // This will be handled by Web3Modal in production
                        }}
                        className="p-4 bg-white border border-emerald-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all"
                      >
                        <span className="text-3xl mb-2 block">{wallet.icon}</span>
                        <span className="text-sm font-medium text-slate-700">
                          {wallet.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => router.push("/portfolio")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-semibold"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Open WalletConnect
                  </Button>

                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-700 text-center">
                      ✅ Most secure method - No need to enter sensitive information
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seed Phrase Tab */}
            <TabsContent value="seed" className="mt-6">
              <Card className="bg-white border-slate-200 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-slate-900">Import Seed Phrase</CardTitle>
                  <CardDescription className="text-slate-600">
                    Enter your 12 or 24-word recovery phrase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="seed-phrase"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Recovery Phrase
                    </label>
                    <textarea
                      id="seed-phrase"
                      rows={4}
                      placeholder="word1 word2 word3 ..."
                      value={seedPhrase}
                      onChange={(e) => setSeedPhrase(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Enter each word separated by a space
                    </p>
                  </div>

                  <Button
                    onClick={handleSeedPhraseImport}
                    disabled={isImporting || !seedPhrase.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-semibold"
                  >
                    {isImporting ? (
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
                        Importing...
                      </div>
                    ) : (
                      "Import Wallet"
                    )}
                  </Button>

                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <p className="text-xs text-rose-700 text-center font-medium">
                      ⚠️ Never share your seed phrase with anyone!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Private Key Tab */}
            <TabsContent value="private" className="mt-6">
              <Card className="bg-white border-slate-200 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-slate-900">Import Private Key</CardTitle>
                  <CardDescription className="text-slate-600">
                    Enter your wallet's private key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="private-key"
                      className="text-sm font-medium text-slate-700 mb-2 block"
                    >
                      Private Key
                    </label>
                    <Input
                      id="private-key"
                      type="password"
                      placeholder="0x..."
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="rounded-xl font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Starts with 0x followed by 64 hexadecimal characters
                    </p>
                  </div>

                  <Button
                    onClick={handlePrivateKeyImport}
                    disabled={isImporting || !privateKey.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-semibold"
                  >
                    {isImporting ? (
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
                        Importing...
                      </div>
                    ) : (
                      "Import Wallet"
                    )}
                  </Button>

                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <p className="text-xs text-rose-700 text-center font-medium">
                      ⚠️ Never share your private key with anyone!
                    </p>
                  </div>
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
