"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

export function Login() {
    const { login, ready, authenticated } = usePrivy();

    const handleLogin = () => {
        login();
    };

    if (!ready) {
        return (
            <Button disabled variant="outline" className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        );
    }

    if (authenticated) {
        return null; // Don't show login buttons if already authenticated
    }

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
            <Button
                onClick={handleLogin}
                className="w-full bg-[#676FFF] hover:bg-[#5a62e6] text-white"
            >
                Sign in / Connect Wallet
            </Button>
            <p className="text-center text-xs text-slate-500">
                Powered by Privy • Secure & Non-Custodial
            </p>
        </div>
    );
}
