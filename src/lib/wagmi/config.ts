import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import type { Chain } from "viem";

// Arc Testnet custom chain configuration
// Update these values with actual Arc Testnet details when available
export const arcTestnet = {
  id: 41455, // Placeholder - update with actual Arc Testnet chain ID
  name: "Arc Testnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.arc.network"], // Placeholder - update with actual RPC
    },
    public: {
      http: ["https://rpc-testnet.arc.network"], // Placeholder - update with actual RPC
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Testnet Explorer",
      url: "https://explorer-testnet.arc.network", // Placeholder - update with actual explorer
    },
  },
  testnet: true,
} as const satisfies Chain;

export const wagmiConfig = getDefaultConfig({
  appName: "Grid - The Income Operating System",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder-project-id",
  chains: [
    sepolia, // Using Sepolia as primary testnet for now
    // arcTestnet, // Uncomment when Arc Testnet details are available
  ],
  ssr: true, // Enable Server-Side Rendering support
});
