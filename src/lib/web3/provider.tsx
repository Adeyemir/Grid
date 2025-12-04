"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { config, projectId } from "./config";

// Setup queryClient
const queryClient = new QueryClient();

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#059669", // Emerald-600
    "--w3m-border-radius-master": "12px",
  },
});

export function Web3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClientInstance] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClientInstance}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
