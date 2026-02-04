import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { WalletProvider } from "~/lib/wallet/WalletProvider";
import { PrivacyProvider } from "~/contexts/PrivacyContext";

export const metadata: Metadata = {
  title: "Grid - The Income Operating System",
  description: "Earn, grow, and spend stablecoins instantly on the Arc Network",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <TRPCReactProvider>
          <PrivacyProvider>
            <WalletProvider>{children}</WalletProvider>
            <Toaster position="top-center" richColors />
          </PrivacyProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
