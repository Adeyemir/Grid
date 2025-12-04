# Project Brief: Grid

**Project Name:** Grid
**Context:** "Post-Bank" Financial Operating System for the Global Workforce
**Date:** 2025-12-03
**Author:** Ade & BMad Team

---

## 1. Executive Summary
**Grid** is a financial super-app built on the **Arc** network that replaces the traditional bank account for global gig workers and freelancers. While competitors focus on merely *moving* money (payroll), Grid focuses on *keeping and growing* it.

The core value proposition is **"The Income Operating System"**:
1.  **Earn:** Receive stablecoin payroll instantly with near-zero fees (vs. 5-10% wire fees).
2.  **Grow:** Access US-market yields and tokenized stocks (RWAs) previously inaccessible to global workers.
3.  **Spend:** Utilize funds instantly via virtual cards and agentic bill pay without manual off-ramping.

---

## 2. Project Classification
* **Type:** Consumer Fintech / Web3 Mobile App
* **Domain:** DeFi / Payments (High Complexity)
* **Core Differentiator:** The **"No-Off-Ramp" Ecosystem**. Users can live their financial lives entirely in stablecoins (USDC), avoiding the friction, delays, and fees of converting back to local inflationary currencies until the exact moment of spending.

---

## 3. Success Criteria (Testnet MVP)
Since this is a Visual Prototype, success is measured by **User Perception**:

* **Perceived Speed:** Users must feel that actions (investing, paying bills) are "instant" (< 200ms visual response), validating the "Sync/Grid" brand promise.
* **Concept Validation:** 80% of test users must successfully complete the "Earn → Invest → Spend" loop without external guidance.
* **Trust Metrics:** Users must rate the "Stock Investing" interface as trustworthy despite it being a crypto wallet (UI/UX challenge).

---

## 4. Product Scope

### **IN SCOPE (The "Real" Parts)**
* **Onboarding:** Functional sign-up (Email/Social) creating a non-custodial wallet address on Arc Testnet.
* **The "Paycheck":** Users can use a faucet button to "Simulate Payroll" and see their USDC balance update in real-time.
* **Wallet Basics:** Sending/Receiving testnet USDC between Grid wallets works on-chain.
* **Privacy Controls:** Users can toggle transaction visibility (leveraging Arc's privacy features).

### **SIMULATED (The "Mock" Parts)**
* **Stock Investing:** Users can tap "Buy $50 TSLA." The app *simulates* the trade visually (deducts USDC, adds "TSLA" to dashboard), but **no real RWA contract is called**. Prices are pulled from a mock API.
* **Bill Pay:** Users select a provider (e.g., MTN Data). The app simulates the API call and success screen. No actual airtime is sent.
* **Yield:** The "Savings" tab shows a simulated 5% APY ticker increasing in real-time to demonstrate the value prop.

### **OUT OF SCOPE (For Mainnet)**
* Real Fiat Off-ramps.
* Real KYC/AML integration.
* Actual RWA/Stock token smart contracts.
* Live Mainnet transactions.

---

## 5. Key Features Overview

1.  **Identity:** Social Login + Arc Wallet.
2.  **Earn:** Instant Payroll (Testnet Faucet).
3.  **Grow:** Simulated Stocks/Yields.
4.  **Spend:** Simulated Bill Pay & Virtual Card Reveal.
5.  **Privacy:** Configurable visibility (Public/Private transaction history).

---

## 6. Strategic Pivot
**From:** A simple Payroll Wallet.
**To:** A "Post-Bank" Financial Platform.
**The Insight:** The goal is not just to move money cheap; it is to allow global workers to *keep* their wealth in stable assets (USDC/Stocks) and only convert at the exact moment of spending, maximizing their purchasing power.