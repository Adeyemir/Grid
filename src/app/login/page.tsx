"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useWeb3Auth } from "~/hooks/useWeb3Auth";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "./actions";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Web3 wallet authentication
  const { isAuthenticating, error: web3Error } = useWeb3Auth();

  async function handleEmailSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    try {
      const result = isSignUp
        ? await signUpWithEmail(formData)
        : await signInWithEmail(formData);

      if (result?.error) {
        setError(result.error);
      } else if ("success" in result && result.success && "message" in result) {
        setSuccess(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Welcome to <span className="text-emerald-600">Grid</span>
          </h1>
          <p className="text-slate-500">
            The Income Operating System for the Global Workforce
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white border-slate-200 rounded-xl shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isSignUp ? "Create an account" : "Sign in"}
            </CardTitle>
            <CardDescription className="text-slate-500">
              {isSignUp
                ? "Enter your email to create your Grid account"
                : "Choose your preferred sign-in method"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50 py-6 rounded-xl"
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form action={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="rounded-xl border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="rounded-xl border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-emerald-600">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-semibold"
              >
                {isSignUp ? "Create account" : "Sign in"}
              </Button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>

            {/* Web3 Wallet Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or connect wallet</span>
              </div>
            </div>

            {/* Web3 Auth Status */}
            {web3Error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-sm text-rose-600">{web3Error}</p>
              </div>
            )}

            {isAuthenticating && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
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
                  <span>Authenticating with your wallet...</span>
                </div>
              </div>
            )}

            {/* Connect Wallet Button */}
            <div className="flex justify-center">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                      className="w-full"
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button
                              onClick={openConnectModal}
                              type="button"
                              variant="outline"
                              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-6 rounded-xl font-semibold"
                            >
                              <svg
                                className="mr-2 h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              Connect Wallet
                            </Button>
                          );
                        }

                        return (
                          <div className="flex gap-2">
                            <Button
                              onClick={openChainModal}
                              type="button"
                              variant="outline"
                              className="rounded-xl"
                            >
                              {chain.hasIcon && chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  className="w-5 h-5 mr-2"
                                />
                              )}
                              {chain.name}
                            </Button>

                            <Button
                              onClick={openAccountModal}
                              type="button"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                            >
                              {account.displayName}
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          By continuing, you agree to Grid&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}
