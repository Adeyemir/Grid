# Grid - Product Requirements Document

**Author:** Ade
**Date:** 2025-12-03
**Version:** 1.0

---

## Executive Summary

**Grid** is a financial super-app built on the **Arc** network that replaces the traditional bank account for global gig workers and freelancers. While competitors focus on merely *moving* money (payroll), Grid focuses on *keeping and growing* it.

The core value proposition is **"The Income Operating System"**:
1.  **Earn:** Receive stablecoin payroll instantly with near-zero fees.
2.  **Grow:** Access simulated US-market yields and tokenized stocks (RWAs).
3.  **Spend:** Utilize funds instantly via simulated bill pay without manual off-ramping.

### What Makes This Special

The **"No-Off-Ramp" Ecosystem**. Users can live their financial lives entirely in stablecoins (USDC), avoiding the friction, delays, and fees of converting back to local inflationary currencies until the exact moment of spending. It leverages Arc's **opt-in configurable privacy** to give users control over their financial data visibility.

---

## Project Classification

**Technical Type:** Consumer Fintech / Web3 Mobile App
**Domain:** DeFi / Payments
**Complexity:** High (Future Compliance/Security focus; Testnet MVP focus on UX)

### Domain Context

**Stablecoin-Native Finance:** The product relies on the stability of USDC and the low-cost infrastructure of Arc to make micro-transactions (like buying coffee or paying a $5 bill) economically viable, which is impossible on Ethereum L1 or via SWIFT.

---

## Success Criteria

1.  **Perceived Speed:** All simulated actions (Trades/Bill Pays) must provide visual feedback in **< 200ms** to reinforce the "Instant" brand promise.
2.  **Concept Validation:** 80% of test users must successfully complete the "Earn → Invest → Spend" loop without external guidance.
3.  **Trust Metrics:** Users must rate the "Stock Investing" interface as trustworthy despite it being a crypto wallet (UI/UX challenge).

---

## Product Scope

### MVP - Minimum Viable Product (Testnet Prototype)

* **Identity:** Functional sign-up (Email/Social) creating a non-custodial wallet address on Arc Testnet.
* **The "Paycheck":** Users can trigger a "Simulate Paycheck" action (Faucet) to instantly receive Testnet USDC.
* **Wallet Basics:** Sending/Receiving testnet USDC between Grid wallets works on-chain.
* **Privacy:** UI toggle for Public/Private transaction visibility.
* **Simulated Features:** Stock Investing (Visual trade simulation), Bill Pay (Visual success simulation), Yield Ticker (Visual increment).

### Growth Features (Post-MVP)

* Integration with real RWA protocols (Backed/Swarm) for actual stock ownership.
* Live API connections to Bitrefill for real airtime/data purchases.
* Mainnet deployment with real USDC.

### Vision (Future)

* Physical Visa card issuance via partner (e.g., Gnosis Pay).
* Merchant API allowing gig workers to invoice clients directly from the app.
* AI-driven financial advice for yield optimization.

---

## Functional Requirements

### User Access & Identity
* **FR1:** Users can create a Grid account using social login (Google/Email) which generates a non-custodial Arc Testnet wallet in the background.
* **FR2:** Users can view their total "Net Worth" dashboard aggregating USDC balance and (simulated) investment values.

### Earn (The Payroll Experience)
* **FR3:** Users can copy their USDC wallet address or a "Payment Link" to share with employers.
* **FR4:** Users can trigger a "Simulate Paycheck" action (Faucet) to instantly receive Testnet USDC.
* **FR5:** Users receive a visual notification of incoming funds within <1 second of the transaction.

### Grow (Wealth Simulation)
* **FR6:** Users can browse a directory of supported investment assets (e.g., TSLA, S&P 500, Yield Vaults) with simulated live pricing.
* **FR7:** Users can execute a "Buy" action for an asset. *Note: System updates the UI balance instantly based on mock logic; no real RWA contract interaction.*
* **FR8:** Users can see a "Yield Ticker" on their savings balance that visually increments in real-time to demonstrate the 5% APY value prop.

### Spend (Utility Simulation)
* **FR9:** Users can browse a catalog of local billers (e.g., Airtime, Data, Electricity) filtered by region.
* **FR10:** Users can pay a bill using their USDC balance. *Note: System deducts Testnet USDC and shows a "Success" receipt; no actual API call to biller.*
* **FR11:** Users can generate a "Virtual Card" visual representation with card details masked/unmasked on demand.

### Transaction History & Privacy
* **FR12:** Users can view a unified history of all transactions (Real transfers, Simulated trades, Simulated bill pays) in one chronological feed.
* **FR13:** Users can toggle **"Transaction Privacy"** settings (Public/Private) for specific transaction types (e.g., Keep "Payroll" public for credit building, but make "Bill Pay" private).

---

## Non-Functional Requirements

### Performance
* **NFR1 (Perceived Speed):** All simulated actions (Trades/Bill Pays) must provide visual feedback in **< 200ms**.
* **NFR2 (Mobile First):** The interface must be fully responsive and optimized for mobile touch targets (44px+).

### Trust & Security
* **NFR3 (Trust Design):** The UI must use "Trust Signals" (clean layout, clear confirmation screens, no jargon) to overcome crypto-skepticism.
* **NFR4 (Privacy):** Privacy toggles must clearly indicate the visibility state of the transaction to the user before they confirm.

---

_This PRD captures the essence of Grid - A friction-free, instant payroll wallet built on Arc that treats stablecoins like cash, not crypto.