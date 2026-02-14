# Grid

A stablecoin-native financial application for the global workforce. Grid allows users to receive payments in USDC, invest in simulated assets, and pay bills without converting to local currency.

## Problem

Remote workers and freelancers in emerging markets face three financial barriers:

1. **Receiving payments** - International wire transfers cost 5-10% in fees and take 3-5 days
2. **Preserving value** - Local currencies often depreciate, eroding purchasing power
3. **Accessing investments** - US stocks and high-yield products are inaccessible due to regulatory barriers

## Solution

Grid is a single application where users can:

- **Receive** salary and payments in USDC instantly via the Tempo Network
- **Invest** in simulated stocks, ETFs, and crypto assets (sTSLA, sAAPL, sBTC, etc.)
- **Spend** directly on local bills (mobile data, electricity, TV subscriptions) without manual currency conversion

All balances remain in USDC until the moment of spending, avoiding currency conversion losses.

## Features

- Email, Google, and Twitter authentication via Privy
- Embedded wallet creation on Tempo Network
- Username-based transfers between Grid users
- QR code generation for receiving payments
- Simulated investment portfolio with buy/sell functionality
- Bill payment to local providers (MTN, Airtel, DStv, Ikeja Electric)
- Virtual Visa card display
- Transaction history with filtering
- Privacy mode to hide balances
- Mobile-responsive design

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Authentication | Privy |
| Blockchain | Tempo Network (testnet) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| API | tRPC |
| State | TanStack Query |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── bills/             # Bill payment page
│   ├── cards/             # Virtual card page
│   ├── dashboard/         # Main dashboard
│   ├── invest/            # Investment portfolio
│   ├── onboarding/        # User profile setup
│   ├── transact/          # Send/receive funds
│   └── transactions/      # Transaction history
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts (Privacy)
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and providers
│   ├── tempo/           # Tempo blockchain client
│   └── wallet/          # Wallet provider
└── server/
    └── api/
        └── routers/     # tRPC API routers
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database (Supabase recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/grid.git
cd grid
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and fill in your values:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID |
| `NEXT_PUBLIC_TEMPO_PRIVATE_KEY` | Tempo testnet private key |
| `NEXT_PUBLIC_SITE_URL` | Application URL (for OAuth callbacks) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio |

## Architecture Notes

### Hybrid Approach

Grid uses a hybrid architecture:

- **Real transactions**: USDC transfers between wallets occur on the Tempo testnet
- **Simulated features**: Stock investments and bill payments are recorded in the database but do not interact with real external APIs

This allows the application to demonstrate the full user experience while operating on testnet infrastructure.

### Balance Calculation

Available balance is calculated as:
```
Available Balance = Base USDC Balance - Investment Amount - Bill Payments + Sold Investments
```

This is handled by the `getAvailableBalance` tRPC endpoint and the `useWalletBalance` hook.

### Data Persistence

User data is tied to their profile's wallet address, stored in the `UserProfile` table. This ensures transaction history, investments, and bill payments persist across login sessions.

## API Routes

### Wallet
- `wallet.getBalance` - Get raw USDC balance
- `wallet.getAvailableBalance` - Get balance minus investments and bills
- `wallet.transferFunds` - Transfer USDC between wallets
- `wallet.simulatePayroll` - Add testnet USDC (faucet)

### Invest
- `invest.getAssets` - List available assets
- `invest.getPortfolio` - Get user's holdings
- `invest.buyAsset` - Purchase simulated asset
- `invest.sellAsset` - Sell simulated asset

### Spend
- `spend.getProviders` - List bill providers
- `spend.payBill` - Process bill payment
- `spend.getSpendingHistory` - Get payment history

### User
- `user.getProfile` - Get user profile
- `user.createProfile` - Create profile with username
- `user.updateProfile` - Update profile details

## License

MIT
