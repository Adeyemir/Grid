import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";
import { env } from "~/env";

// Get projectId from environment
export const projectId = env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

// Define metadata
const metadata = {
  name: "Grid",
  description: "Your Income Operating System",
  url: "https://grid.app", // Update with your actual URL
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create wagmiConfig with supported chains
const chains = [mainnet, polygon, arbitrum, base, optimism] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});

// Export chains for use in components
export { chains };
export type SupportedChain = (typeof chains)[number];
