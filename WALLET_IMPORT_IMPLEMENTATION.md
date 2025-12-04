# Grid Wallet Import & Bridging Feature - Implementation Guide

## ✅ Completed

### 1. **Web3 Infrastructure**
- ✅ `src/lib/web3/config.ts` - Wagmi configuration with 5 chains (Ethereum, Polygon, Arbitrum, Base, Optimism)
- ✅ `src/lib/web3/provider.tsx` - Web3Modal provider with emerald theme
- ✅ `src/lib/web3/hooks.ts` - Custom hooks for balances and token management
- ✅ **Packages installed:** `@web3modal/wagmi`, `wagmi`, `viem@2.x`, `@tanstack/react-query`

### 2. **Wallet Import Page**
- ✅ `src/app/wallet/import/page.tsx` - Complete wallet import page with:
  - WalletConnect integration (MetaMask, Rainbow, Trust Wallet, Coinbase)
  - Seed phrase import (12/24 words)
  - Private key import
  - Security warnings
  - Emerald theme styling

## 🚧 Next Steps - Implementation Required

### 3. **Root Layout Update**
Add Web3Provider to wrap your app:

```tsx
// src/app/layout.tsx
import { Web3Provider } from "~/lib/web3/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <TRPCReactProvider>
            <PrivacyProvider>
              {children}
            </PrivacyProvider>
          </TRPCReactProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
```

### 4. **Portfolio View Page**
Create `src/app/portfolio/page.tsx`:

```tsx
"use client";

import { useAccount, useBalance } from "wagmi";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";
import { BridgeModal } from "~/components/BridgeModal";
import { useState } from "react";

export default function PortfolioPage() {
  const { address } = useAccount();
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Fetch balances for each chain
  const chains = [mainnet, polygon, arbitrum, base, optimism];

  return (
    <main>
      <h1>Multi-Chain Portfolio</h1>
      {/* Display balances per chain */}
      {/* Add "Bridge to Grid" buttons */}

      <BridgeModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
      />
    </main>
  );
}
```

### 5. **Bridge Modal Component**
Create `src/components/BridgeModal.tsx`:

```tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    balance: string;
    chain: string;
  } | null;
}

export function BridgeModal({ isOpen, onClose, asset }: BridgeModalProps) {
  const [amount, setAmount] = useState("");
  const BRIDGE_FEE = 0.01; // 1% fee

  const handleBridge = async () => {
    // Call backend to execute bridge
    toast.success("Bridge transaction initiated!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bridge to Grid</DialogTitle>
        </DialogHeader>

        {/* Bridge form */}
        <div>
          <p>From: {asset?.chain}</p>
          <p>Asset: {asset?.symbol}</p>
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p>Fee: {(parseFloat(amount) * BRIDGE_FEE).toFixed(2)} USDC</p>

          <Button onClick={handleBridge}>
            Bridge to Grid
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 6. **Backend Bridge Router**
Create `src/server/api/routers/bridge.ts`:

```typescript
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const bridgeRouter = createTRPCRouter({
  executeBridge: publicProcedure
    .input(
      z.object({
        fromChain: z.string(),
        toChain: z.string(),
        token: z.string(),
        amount: z.number(),
        walletAddress: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Simulate bridge transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production:
      // 1. Lock funds on source chain
      // 2. Credit funds on Grid (Arc) wallet
      // 3. Record transaction

      return {
        success: true,
        transactionHash: `0x${Math.random().toString(16).slice(2)}`,
        bridgedAmount: input.amount * 0.99, // After 1% fee
      };
    }),
});
```

Add to `src/server/api/root.ts`:
```typescript
import { bridgeRouter } from "./routers/bridge";

export const appRouter = createTRPCRouter({
  // ... existing routers
  bridge: bridgeRouter,
});
```

### 7. **Dashboard Updates**
Update `src/app/dashboard/page.tsx` to show:

```tsx
// Add after existing wallet card
{/* External Wallets Section */}
{isConnected && (
  <Card>
    <CardHeader>
      <CardTitle>External Wallets</CardTitle>
      <CardDescription>
        Your imported wallet balances across chains
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Display balances per chain */}
      {/* "Bridge to Grid" buttons */}

      <Button onClick={() => router.push("/portfolio")}>
        View Full Portfolio
      </Button>
    </CardContent>
  </Card>
)}
```

### 8. **Transact Page Updates**
Update `src/app/transact/page.tsx`:

**Receive Tab - Add External Wallet Section:**
```tsx
{/* After existing receive sections */}
<Card>
  <CardHeader>
    <CardTitle>Receive to External Wallet</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Show address per chain */}
    <Tabs>
      <TabsList>
        <TabsTrigger>Ethereum</TabsTrigger>
        <TabsTrigger>Polygon</TabsTrigger>
        {/* ... other chains */}
      </TabsList>

      <TabsContent>
        {/* Address + QR code per chain */}
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

**Send Tab - Add External Wallet Option:**
```tsx
{/* New send method card */}
<Card>
  <CardHeader>
    <CardTitle>Send from External Wallet</CardTitle>
    <CardDescription>
      Send from your imported multi-chain wallet
    </CardDescription>
  </CardHeader>
  <CardContent>
    <select>
      <option>Ethereum</option>
      <option>Polygon</option>
      {/* ... chains */}
    </select>

    <Input placeholder="Recipient address" />
    <Input placeholder="Amount" />

    <Button>Send from Wallet</Button>
  </CardContent>
</Card>
```

## 🎨 Component Examples

### PortfolioCard Component
Create `src/components/PortfolioCard.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export function PortfolioCard({
  chain,
  balance,
  symbol,
  usdValue,
  onBridge
}: {
  chain: string;
  balance: string;
  symbol: string;
  usdValue: string;
  onBridge: () => void;
}) {
  return (
    <Card className="bg-white border-slate-200 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{chain}</CardTitle>
          <span className="text-2xl">⛓️</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {balance} {symbol}
            </p>
            <p className="text-sm text-slate-500">${usdValue}</p>
          </div>

          <Button
            onClick={onBridge}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            Bridge to Grid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### WalletConnectButton Component
Create `src/components/WalletConnectButton.tsx`:

```tsx
"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "~/components/ui/button";

export function WalletConnectButton() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="rounded-xl"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => open()}
      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
    >
      Connect Wallet
    </Button>
  );
}
```

## 🔐 Security Considerations

1. **Never store private keys or seed phrases in state or localStorage**
2. **Use Web3Modal for wallet connections** (most secure)
3. **Validate all addresses** before transactions
4. **Show transaction confirmations** before executing
5. **Implement rate limiting** on bridge endpoints
6. **Add transaction history** for audit trail

## 📊 Testing Checklist

- [ ] Install packages successfully
- [ ] Web3Provider wraps app in layout
- [ ] Wallet import page accessible at `/wallet/import`
- [ ] WalletConnect modal opens and connects
- [ ] Portfolio page shows balances across chains
- [ ] Bridge modal opens with correct asset info
- [ ] Bridge transaction executes and updates Grid balance
- [ ] Dashboard shows both external and Grid wallets
- [ ] Transact page has external wallet send/receive options
- [ ] All emerald theme styling consistent

## 🚀 Production Deployment

### Environment Variables Required:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
# Already in .env
```

### Smart Contract Integration (Future):
- Deploy bridge contracts on each supported chain
- Implement lock/mint mechanism
- Add liquidity pools for token swaps
- Integrate with Circle CCTP for USDC transfers

## 📱 Mobile Considerations

- Web3Modal is mobile-responsive
- WalletConnect works with mobile wallets
- Test on iOS Safari and Android Chrome
- Ensure QR codes are scannable
- Touch targets meet 44px minimum

## 🎯 Feature Priority

1. **High Priority**: WalletConnect integration (easiest, most secure)
2. **Medium Priority**: Portfolio view and bridge modal
3. **Low Priority**: Seed phrase/private key import (advanced users only)

## 💡 Tips

- Start with WalletConnect only - most users prefer this
- Mock the bridge for MVP - implement real smart contracts later
- Use testnet first (Goerli, Mumbai, etc.)
- Add loading states for all async operations
- Show gas estimates before transactions

---

**All foundational files are created. Follow this guide to complete the integration!**
