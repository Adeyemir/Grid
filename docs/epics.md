# Grid - Epic & Story Breakdown

**Author:** John (BMad PM)
**Date:** 2025-12-03
**Context:** MVP (Testnet Prototype)
**Tech Stack:** Next.js (T3), Privy, Supabase, Tailwind/shadcn

---

## Overview
This breakdown transforms the **Grid** PRD into implementable code. It follows a "Hybrid" strategy: real blockchain interactions for the Wallet/Payroll features, and a simulated database layer for DeFi/Investing features to validate the UX speed.

---

## Epic 1: Project Foundation & Infrastructure
**Goal:** Initialize the "construction site" so developers can work efficiently. Establish the T3 stack, styling tokens, and database connections.

### Story 1.1: Initialize T3 Monorepo
**As a** Developer,
**I want** to set up the Next.js project with the defined stack,
**So that** we have a stable foundation for features.

* **Acceptance Criteria:**
    * [ ] Next.js (App Router) initialized with TypeScript.
    * [ ] tRPC and Prisma installed and configured.
    * [ ] Tailwind CSS configured with custom "Growth Emerald" colors (Primary: `#059669`, Background: `#f8fafc`).
    * [ ] Folder structure matches Architecture doc (src/components/ui, src/server/api).
    * [ ] App renders a "Hello Grid" landing page in Emerald Green.

### Story 1.2: Setup Supabase & Schema
**As a** Developer,
**I want** to configure the database schema,
**So that** we can store user profiles and simulated assets.

* **Acceptance Criteria:**
    * [ ] Supabase project created.
    * [ ] `users_meta` table created (links Privy Wallet ID to local prefs).
    * [ ] `simulated_assets` table created (columns: user_id, symbol, amount).
    * [ ] `transactions` table created (for merging real/fake history).
    * [ ] Prisma schema updated and pushed to DB.

### Story 1.3: Install Design System (shadcn/ui)
**As a** Developer,
**I want** to install the base UI components,
**So that** we don't reinvent buttons and inputs.

* **Acceptance Criteria:**
    * [ ] shadcn/ui initialized.
    * [ ] Base components installed: Button, Card, Input, Toast, Dialog, Switch, Skeleton.
    * [ ] Font family set to **Inter**.
    * [ ] Components styled to match UX Spec "Clean & Spacious" direction (rounded-xl corners).

---

## Epic 2: Identity & Wallet (The "Real" Layer)
**Goal:** Users can sign in and get a real Arc Testnet wallet address.

### Story 2.1: Social Login Integration
**As a** User,
**I want** to sign in with Google or Email,
**So that** I can access my account without managing private keys.

* **Acceptance Criteria:**
    * [ ] User sees a clean Login screen with "Continue with Google".
    * [ ] Upon success, user is redirected to Dashboard.
    * [ ] A `user_id` is generated and stored in Supabase.

### Story 2.2: Privy Embedded Wallet Creation
**As a** System,
**I want** to generate a wallet for the new user,
**So that** they have an address on Arc Testnet.

* **Acceptance Criteria:**
    * [ ] Background process creates embedded wallet via Privy on signup.
    * [ ] A dedicated EOA wallet is created automatically.
    * [ ] The "0x..." address is displayed on the user's profile card.
    * [ ] **Technical Note:** Privy handles gasless transactions seamlessly.

---

## Epic 3: The "Earn" Loop (Payroll)
**Goal:** Validate the core value prop—receiving money instantly.

### Story 3.1: The Faucet (Simulate Paycheck)
**As a** User,
**I want** to click a "Simulate Payroll" button,
**So that** I can receive Testnet USDC to play with.

* **Acceptance Criteria:**
    * [ ] "Deposit" button opens a modal with "Simulate Paycheck" option.
    * [ ] Clicking triggers backend to send 500 USDC (Testnet) from Treasury to User.
    * [ ] UX: Show a "Processing..." spinner.
    * [ ] **Performance:** Transaction must initiate within 200ms.

### Story 3.2: Real-Time Balance Display
**As a** User,
**I want** to see my balance update the moment money arrives,
**So that** I trust the speed of the network.

* **Acceptance Criteria:**
    * [ ] Dashboard shows Total Balance in large, bold Inter font.
    * [ ] UI polls balance API (or uses tRPC) to update balance automatically.
    * [ ] **UX Note:** When balance increases, trigger a subtle green highlight/flash animation.

---

## Epic 4: The "Grow" Loop (Simulated DeFi)
**Goal:** The "Hollywood Set" features. Make the user feel like an investor using simulated data.

### Story 4.1: The Yield Ticker (UX Magic)
**As a** User,
**I want** to see my money growing in real-time,
**So that** I feel the benefit of holding stablecoins.

* **Acceptance Criteria:**
    * [ ] Dashboard displays a "Yield Earned" sub-counter.
    * [ ] **Micro-interaction:** The counter visually increments (e.g., +$0.0001) every 3 seconds via CSS/JS animation.
    * [ ] Note: This is purely visual math based on a fake 5% APY; does not require backend transactions.

### Story 4.2: Asset Directory (Simulated Market)
**As a** User,
**I want** to browse stocks like TSLA or S&P 500,
**So that** I can decide where to invest.

* **Acceptance Criteria:**
    * [ ] "Invest" tab lists 5-10 mock assets (sTSLA, sAAPL, sBTC).
    * [ ] Prices are fetched from a mock API (or free Yahoo Finance API) to look real.
    * [ ] Assets display 24h change (Green/Red arrows).

### Story 4.3: Buying Assets (The Mock Trade)
**As a** User,
**I want** to buy $50 of Tesla,
**So that** I can diversify my income.

* **Acceptance Criteria:**
    * [ ] "Buy" modal allows entering USDC amount.
    * [ ] **Simulation Logic:**
        1. Frontend calls tRPC `buyAsset`.
        2. Backend verifies USDC balance (Real).
        3. Backend DEDUCTS simulated USDC amount (record debt in DB).
        4. Backend ADDS `sTSLA` to `simulated_assets` table.
        5. **Latency Rule:** Enforce `await delay(500)` to make it feel like a real network call.
    * [ ] Success Toast: "Bought 0.4 sTSLA".

---

## Epic 5: The "Spend" Loop
**Goal:** Prove liquidity.

### Story 5.1: Bill Pay Simulation
**As a** User,
**I want** to pay a mobile data bill,
**So that** I can use my crypto for daily life.

* **Acceptance Criteria:**
    * [ ] "Bills" tab shows list of providers (MTN, Airtel, Disco).
    * [ ] User enters Phone Number and Amount.
    * [ ] "Pay" button triggers simulation.
    * [ ] Success Screen shows a receipt with "Paid via Arc Network."

### Story 5.2: Virtual Card Reveal
**As a** User,
**I want** to see my virtual card details,
**So that** I can shop online.

* **Acceptance Criteria:**
    * [ ] "Card" tab shows a beautifully styled VISA card (CSS gradients).
    * [ ] Card number is masked (`•••• 4242`) by default.
    * [ ] "Reveal" button unmasks details.
    * [ ] Note: No real card issuance API needed for prototype; use static mock data.

---

## Epic 6: Privacy & Polish
**Goal:** Provide users with privacy controls and polished UI experience.

### Story 6.1: The Global Privacy Toggle
**As a** User,
**I want** to hide my sensitive balances with one click,
**So that** I can open the app in public safely.

* **Acceptance Criteria:**
    * [ ] "Eye" icon in the top header.
    * [ ] **State OFF:** Balances blurred (`blur-sm` Tailwind class) or replaced with `••••`.
    * [ ] **State ON:** Balances visible.
    * [ ] Toggle state persists in local storage.

### Story 6.2: Transaction Privacy Settings
**As a** User,
**I want** to mark specific transactions as Private,
**So that** they don't show up in public data.

* **Acceptance Criteria:**
    * [ ] In Transaction Details, show "Visibility" toggle.
    * [ ] If set to Private, update `privacy_setting` in Supabase.
    * [ ] **Visual Feedback:** Show a "Lock" icon next to private transactions in the history list.

### Story 6.3: Mobile Responsiveness Check
**As a** User,
**I want** the app to feel native on my phone,
**So that** I trust it as my primary wallet.

* **Acceptance Criteria:**
    * [ ] Bottom Navigation bar appears ONLY on mobile screens (<640px).
    * [ ] Buttons are full width and 44px+ height on mobile.
    * [ ] No horizontal scrolling on any page.
    * [ ] Input fields do not zoom the browser (font-size 16px+).

---

## Summary for Developers
* **Total Epics:** 6
* **Total Stories:** 14
* **Critical Path:** Epic 1 -> Epic 2 -> Epic 4 (This gets us "Earn" and "Grow").
* **Key Constraint:** Maintain the "Emerald/Clean" aesthetic defined in UX specs. Never expose raw JSON or blockchain error codes to the user.