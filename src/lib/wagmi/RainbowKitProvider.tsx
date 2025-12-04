"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider as RKProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./config";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

interface RainbowKitProviderProps {
  children: ReactNode;
}

export function RainbowKitProvider({ children }: RainbowKitProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RKProvider
          theme={darkTheme({
            accentColor: "#059669", // Growth Emerald accent
            accentColorForeground: "white",
            borderRadius: "large",
          })}
        >
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
