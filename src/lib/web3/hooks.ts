import { useAccount, useBalance, useChainId, useDisconnect } from "wagmi";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";
import type { Address } from "viem";

// Hook to get all balances across chains
export function useMultiChainBalances(address?: Address) {
  const chains = [mainnet, polygon, arbitrum, base, optimism];

  const balances = chains.map((chain) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useBalance({
      address,
      chainId: chain.id,
    });

    return {
      chain: chain.name,
      chainId: chain.id,
      balance: data?.formatted ?? "0",
      symbol: data?.symbol ?? "ETH",
      decimals: data?.decimals ?? 18,
      isLoading,
    };
  });

  return balances;
}

// Hook for imported wallet info
export function useImportedWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    chainId,
    disconnect,
  };
}

// Token list for portfolio (common ERC20 tokens)
export const COMMON_TOKENS = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    addresses: {
      [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
      [polygon.id]: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as Address,
      [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address,
      [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
      [optimism.id]: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" as Address,
    },
    decimals: 6,
    logo: "💵",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    addresses: {
      [mainnet.id]: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as Address,
      [polygon.id]: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as Address,
      [arbitrum.id]: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as Address,
      [optimism.id]: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58" as Address,
    },
    decimals: 6,
    logo: "💲",
  },
  DAI: {
    symbol: "DAI",
    name: "Dai Stablecoin",
    addresses: {
      [mainnet.id]: "0x6B175474E89094C44Da98b954EedeAC495271d0F" as Address,
      [polygon.id]: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" as Address,
      [arbitrum.id]: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" as Address,
      [base.id]: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb" as Address,
      [optimism.id]: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" as Address,
    },
    decimals: 18,
    logo: "💎",
  },
};

export type TokenInfo = typeof COMMON_TOKENS[keyof typeof COMMON_TOKENS];
