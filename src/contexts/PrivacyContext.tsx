"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacy: () => void;
  maskValue: (value: string | number, type?: "currency" | "text") => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const PRIVACY_STORAGE_KEY = "grid-privacy-mode";

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load privacy setting from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
      if (stored !== null) {
        setIsPrivacyMode(stored === "true");
      }
    }
    setIsHydrated(true);
  }, []);

  // Save privacy setting to localStorage when it changes
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem(PRIVACY_STORAGE_KEY, String(isPrivacyMode));
    }
  }, [isPrivacyMode, isHydrated]);

  const togglePrivacy = () => {
    setIsPrivacyMode((prev) => !prev);
  };

  const maskValue = (value: string | number, type: "currency" | "text" = "currency") => {
    if (!isPrivacyMode) {
      return String(value);
    }

    if (type === "currency") {
      // Mask currency values with ••••
      return "••••";
    }

    // For text, replace with appropriate number of dots
    const valueStr = String(value);
    if (valueStr.length <= 4) {
      return "••••";
    }
    // Keep last 4 characters visible for addresses/account numbers
    return "•".repeat(valueStr.length - 4) + valueStr.slice(-4);
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}
