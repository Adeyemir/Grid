# Grid - Architecture & Technical Design

**Author:** Winston (BMad Architect)
**Date:** 2025-12-03
**Version:** 1.0
**Context:** Hybrid "Visual Prototype" (Real Wallet + Simulated DeFi)

---

## 1. Executive Summary

The **Grid** architecture is designed to validate the user experience of a "Post-Bank" financial OS on the **Tempo Testnet**. It employs a **Hybrid Architecture**:
1.  **Real Layer:** Uses **Privy Embedded Wallets** for actual identity and USDC transfers on Tempo.
2.  **Simulated Layer:** Uses **Supabase** to mock advanced DeFi features (Stocks, Bill Pay) that are not yet live on Mainnet.
3.  **Unified Frontend:** A **Next.js (T3 Stack)** application that seamlessly blends both layers into a single, instant (<200ms) user interface.

---

## 2. Decision Summary

| Category | Decision | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Foundation** | **Next.js (T3 Stack)** | v14+ (App Router) | Best balance of rapid prototyping speed and mobile-ready PWA delivery. |
| **Styling** | **Tailwind CSS** | v3.4+ | Utility-first styling allows for rapid UI iteration and mobile optimization. |
| **Wallet/Auth** | **Privy** | Web SDK | Social login with embedded wallets on Tempo; handles gasless UX seamlessly. |
| **Database** | **Supabase** | PostgreSQL | Persists simulated asset data and privacy settings so the prototype feels "real" across sessions. |
| **API Pattern** | **tRPC** | v11+ | End-to-end type safety connects the frontend to the aggregated backend logic instantly. |

---

## 3. System Architecture Diagram

```mermaid
graph TD
    User[User Mobile PWA] -->|Interacts| UI[Grid Interface]

    subgraph "Next.js Backend (tRPC)"
        UI -->|Reads/Writes| Aggregator[Data Aggregator]
        Aggregator -->|Real Tx| PrivyAPI[Privy Wallet API]
        Aggregator -->|Fake Tx| SupabaseAPI[Supabase DB]
    end

    subgraph "External Systems"
        PrivyAPI -->|Settles on| Tempo[Tempo Testnet]
        SupabaseAPI -->|Persists| Postgres[Simulated Ledger]
    end