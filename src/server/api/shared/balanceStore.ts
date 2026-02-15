// Shared balance store - used by wallet, spend, and invest routers
// In production, this would be replaced with blockchain queries

const balances = new Map<string, number>();

export const balanceStore = {
  get: (walletAddress: string): number => {
    return balances.get(walletAddress) ?? 0;
  },

  set: (walletAddress: string, amount: number): void => {
    balances.set(walletAddress, amount);
  },

  add: (walletAddress: string, amount: number): number => {
    const current = balances.get(walletAddress) ?? 0;
    const newBalance = current + amount;
    balances.set(walletAddress, newBalance);
    return newBalance;
  },

  subtract: (walletAddress: string, amount: number): number => {
    const current = balances.get(walletAddress) ?? 0;
    if (current < amount) {
      throw new Error("Insufficient balance");
    }
    const newBalance = current - amount;
    balances.set(walletAddress, newBalance);
    return newBalance;
  },

  hasEnough: (walletAddress: string, amount: number): boolean => {
    const current = balances.get(walletAddress) ?? 0;
    return current >= amount;
  },
};
