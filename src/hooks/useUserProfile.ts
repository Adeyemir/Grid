"use client";

import { useGridAuth } from "~/hooks/useGridAuth";
import { api } from "~/trpc/react";

export function useUserProfile() {
  const { user, ready, isAuthenticated } = useGridAuth();

  const {
    data: profile,
    isLoading,
    isFetching,
    error,
    refetch,
  } = api.user.getProfile.useQuery(
    { privyUserId: user?.id ?? "" },
    {
      enabled: !!user?.id && ready && isAuthenticated,
      staleTime: 30 * 1000, // Cache for 30 seconds - invalidation handles fresh data after profile creation
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    }
  );

  return {
    profile,
    isLoading: !ready || (isLoading && !profile), // Only show loading if we don't have cached data
    isFetching,
    error,
    refetch,
    hasProfile: !!profile,
    needsOnboarding: ready && isAuthenticated && !isLoading && !profile,
  };
}
