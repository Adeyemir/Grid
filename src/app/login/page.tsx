"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGridAuth } from "~/hooks/useGridAuth";
import { Button } from "~/components/ui/button";
import {
  Loader2,
  Wallet,
  TrendingUp,
  Receipt,
  Shield,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, ready, isAuthenticated } = useGridAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (ready && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [ready, isAuthenticated, router]);

  const handleLogin = () => {
    login();
  };

  // Show loading while Privy initializes
  if (!ready) {
    return (
      <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </main>
    );
  }

  // Show loading while redirecting authenticated users
  if (isAuthenticated) {
    return (
      <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Entering Grid...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 flex flex-col overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-80" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md mx-auto">
          {/* Logo & Brand */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-xl shadow-emerald-200 mb-6">
              <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              Grid
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-xs mx-auto leading-relaxed">
              The Income Operating System for the Global Workforce
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                Get Started
              </h2>
              <p className="text-sm text-slate-500">
                Connect with your preferred method
              </p>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl font-semibold text-base transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Supported</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Supported Methods */}
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-100 hover:border-emerald-200">
                <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
                </svg>
                <span className="text-xs text-slate-500">Google</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-100 hover:border-emerald-200">
                <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs text-slate-500">X</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-100 hover:border-emerald-200">
                <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                </svg>
                <span className="text-xs text-slate-500">Email</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-100 hover:border-emerald-200">
                <Wallet className="h-5 w-5 text-slate-600" />
                <span className="text-xs text-slate-500">Wallet</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-6 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">
                Secured by Privy • Non-Custodial
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-600 text-center font-medium">Send & Receive</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-600 text-center font-medium">Invest & Grow</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-600 text-center font-medium">Pay Bills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-6 text-center">
        <p className="text-xs text-slate-400">
          By continuing, you agree to Grid&apos;s{" "}
          <span className="text-slate-600 hover:text-emerald-600 cursor-pointer transition-colors">Terms</span>
          {" "}&{" "}
          <span className="text-slate-600 hover:text-emerald-600 cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </main>
  );
}
