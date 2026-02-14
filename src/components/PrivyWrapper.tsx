"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { tempoModerato } from "viem/chains";

import { env } from "~/env";

export default function PrivyWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const appId = env.NEXT_PUBLIC_PRIVY_APP_ID;

    if (!appId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center border border-red-100">
                    <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                        Configuration Missing
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                        Please add your <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">NEXT_PUBLIC_PRIVY_APP_ID</code> to the <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code> file.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-left font-mono text-slate-600 border border-slate-200 overflow-x-auto">
                        NEXT_PUBLIC_PRIVY_APP_ID="your-app-id"
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PrivyProvider
            appId={appId}
            config={{
                loginMethods: ["email", "wallet", "google", "twitter"],
                appearance: {
                    theme: "light",
                    accentColor: "#10B981", // Emerald-500 to match Grid branding
                },
                supportedChains: [tempoModerato],
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: "users-without-wallets",
                    },
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
