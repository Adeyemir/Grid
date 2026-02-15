# Grid - UX Design Specification

**Created by:** Sally (BMad UX Designer)
**Date:** 2025-12-03
**Version:** 1.0
**Status:** Ready for Implementation

---

## 1. Executive Summary

**Grid** is the "Income Operating System" for the global workforce. The user experience is defined by **speed, transparency, and liquidity**.

Unlike traditional banking apps (cluttered, slow, punitive), Grid feels **light, instant, and empowering**. The interface hides the complexity of blockchain (Tempo) and DeFi behind a familiar, "Neo-Bank" aesthetic.

**Core Design Philosophy:** "Invisible Infrastructure." The user should never feel the "crypto" friction; they should only feel the financial freedom.

---

## 2. Design System Foundation

### 2.1 Technology Choice
* **System:** **shadcn/ui**
* **Rationale:** Provides accessible, robust primitives (Radix UI) while allowing 100% styling control via Tailwind CSS. Perfect for the T3 Stack.
* **Icon Set:** **Lucide Icons** (Clean, distinct, standard with shadcn).

### 2.2 Component Strategy
* **Base Components:** Use shadcn defaults for Inputs, Dialogs, Dropdowns, and Toasts.
* **Custom Components:**
    * `WalletCard`: The primary dashboard element showing Balance + Yield Ticker.
    * `AssetRow`: List item for Stocks/Bills with logo, name, status, and value.
    * `PrivacyToggle`: A specialized switch component to toggle `blur-sm` class on sensitive data.

---

## 3. Visual Foundation

### 3.1 Color System: "Growth Emerald"
Targeting optimism, wealth accumulation, and stability.

| Role | Color | Tailwind Class | Hex | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | **Emerald 600** | `bg-emerald-600` | `#059669` | Main actions (Send, Invest), Active states. |
| **Secondary** | **Emerald 100** | `bg-emerald-100` | `#ecfdf5` | Secondary buttons, Active backgrounds. |
| **Background** | **Slate 50** | `bg-slate-50` | `#f8fafc` | App background (keeps it airy). |
| **Surface** | **White** | `bg-white` | `#ffffff` | Cards, Modals, Bottom Sheet. |
| **Text Main** | **Slate 900** | `text-slate-900` | `#0f172a` | Headings, Primary values. |
| **Text Muted** | **Slate 500** | `text-slate-500` | `#64748b` | Labels, Helper text. |
| **Error** | **Rose 600** | `text-rose-600` | `#e11d48` | Failed transactions, dangerous actions. |

### 3.2 Typography: Inter
* **Headings:** `font-bold tracking-tight` (e.g., Balance Display).
* **Numbers:** `tabular-nums` (Critical for financial data alignment).
* **Body:** `text-sm leading-relaxed` (Standard readability).

---

## 4. Core User Experience

### 4.1 The Defining Experience: "The Pulse"
The core dashboard isn't static. It breathes.
* **The Yield Ticker:** The user's balance should visually increment (micro-animation) every few seconds to show the 5% APY working.
* **Instant Feedback:** When "Simulate Payroll" is clicked, the notification arrives in <200ms with a haptic tap.

### 4.2 Privacy Pattern
* **Global Toggle:** An "Eye" icon in the top right header.
* **State ON:** All balances and transaction amounts are visible.
* **State OFF:** All sensitive numbers are replaced with `••••` or blurred.
* **Use Case:** User opens app in public/coffee shop.

---

## 5. User Journey Flows

### 5.1 Journey: Receive & Verify Pay
1.  **Trigger:** User taps "Deposit" or shares Payment Link.
2.  **Action:** Employer sends funds (Simulated via Faucet).
3.  **Feedback:**
    * Full-screen "Confetti" or "Success Ripple" animation.
    * Haptic Feedback (Success Pattern).
    * Notification: "Paycheck Received: $500.00 USDC".
4.  **Result:** Balance updates instantly. Yield ticker speed increases slightly (visual metaphor).

### 5.2 Journey: Just-in-Time Bill Pay
1.  **Entry:** Tap "Bills" -> Select "MTN Data".
2.  **Input:** Enter Phone Number + Amount.
3.  **Action:** Slide-to-Pay (prevents accidental taps).
4.  **Feedback:**
    * Spinner (500ms artificial delay for realism).
    * "Paid" stamp animation.
5.  **Result:** Deduction from USDC balance shown in red in history.

---

## 6. UX Consistency Rules (Pattern Library)

### 6.1 Navigation (Mobile Bottom Bar)
* **Home:** Dashboard, Balance, Recent Activity.
* **Invest:** Stocks, Yield Vaults.
* **Scan/Pay:** Central FAB (Floating Action Button) for QR codes or quick transfers.
* **Cards:** Virtual Card management.
* **Profile:** Settings, Security, Privacy.

### 6.2 Feedback Patterns
* **Success:** Toast notification at top of screen (Green).
* **Error:** Inline error message below input field (Red) + Shake animation.
* **Loading:** Skeleton loaders (shimmer effect) for data fetching; Spinner inside buttons for actions.

### 6.3 Input Formatting
* **Currency Inputs:** Auto-format with commas (`1,000`) and fixed decimals (`.00`).
* **Crypto Addresses:** Truncate middle (`0x12...45ef`) with "Copy" icon always present.

---

## 7. Responsive Strategy

* **Mobile (Primary):** Single column, bottom navigation, full-width buttons (44px+ height).
* **Desktop (Secondary):** Max-width centered container (phone simulator view) OR split view (Nav on left, Content in middle, Details on right).
* **Breakpoints:**
    * `sm`: 640px (Mobile view)
    * `md`: 768px (Tablet - Sidebar appears)
    * `lg`: 1024px (Desktop - Spacious grid)

---

## 8. Accessibility Requirements (WCAG AA)

* **Contrast:** All text on Emerald backgrounds must pass 4.5:1 ratio.
* **Touch Targets:** All interactive elements min 44x44px.
* **Screen Readers:**
    * Balance readings must announce "Total Balance, 2 thousand 4 hundred..."
    * Trend arrows (▲/▼) must have `aria-label="Increased by"` or `"Decreased by"`.
* **Focus:** Visible ring on all inputs/buttons for keyboard navigation.

---

_This specification guides the implementation of the Grid frontend. It prioritizes trust, speed, and clarity to drive mass adoption of stablecoin finance._