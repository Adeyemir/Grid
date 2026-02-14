"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useGridAuth } from "~/hooks/useGridAuth";
import { api } from "~/trpc/react";
import { Loader2, Check, X } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { user, ready, isAuthenticated, walletAddress } = useGridAuth();
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    reason: string | null;
  } | null>(null);

  // Get existing profile
  const { data: existingProfile, isLoading: profileLoading } =
    api.user.getProfile.useQuery(
      { privyUserId: user?.id ?? "" },
      { enabled: !!user?.id }
    );

  // Check username availability
  const checkUsernameMutation = api.user.checkUsername.useQuery(
    { username },
    {
      enabled: username.length >= 3 && isChecking,
      refetchOnWindowFocus: false,
    }
  );

  // Create profile mutation
  const createProfileMutation = api.user.createProfile.useMutation({
    onSuccess: async () => {
      // Invalidate the profile query cache so dashboard gets fresh data
      await utils.user.getProfile.invalidate();
      router.push("/dashboard");
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push("/");
    }
  }, [ready, isAuthenticated, router]);

  // Redirect if user already has a profile
  useEffect(() => {
    if (existingProfile) {
      router.push("/dashboard");
    }
  }, [existingProfile, router]);

  // Debounce username check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Update status when check completes
  useEffect(() => {
    if (checkUsernameMutation.data && !isChecking) {
      setUsernameStatus(checkUsernameMutation.data);
    }
  }, [checkUsernameMutation.data, isChecking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !usernameStatus?.available) return;

    createProfileMutation.mutate({
      privyUserId: user.id,
      username,
      walletAddress: walletAddress ?? undefined,
    });
  };

  const isValidUsername = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  const canSubmit = isValidUsername && usernameStatus?.available && !createProfileMutation.isPending;

  if (!ready || profileLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">G</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Welcome to <span className="text-emerald-600">Grid</span>
              </CardTitle>
              <CardDescription className="text-slate-500">
                Choose a username to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-slate-700"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      @
                    </span>
                    <Input
                      id="username"
                      type="text"
                      placeholder="yourname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      className="pl-8 pr-10 h-12 text-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      maxLength={20}
                      autoComplete="off"
                      autoFocus
                    />
                    {username.length >= 3 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isChecking || checkUsernameMutation.isFetching ? (
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        ) : usernameStatus?.available ? (
                          <Check className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="min-h-[20px]">
                    {username.length > 0 && username.length < 3 && (
                      <p className="text-sm text-slate-500">
                        Username must be at least 3 characters
                      </p>
                    )}
                    {username.length >= 3 && !isValidUsername && (
                      <p className="text-sm text-red-500">
                        Only letters, numbers, and underscores allowed
                      </p>
                    )}
                    {usernameStatus && !usernameStatus.available && (
                      <p className="text-sm text-red-500">
                        {usernameStatus.reason}
                      </p>
                    )}
                    {usernameStatus?.available && (
                      <p className="text-sm text-emerald-600">
                        Username is available!
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg rounded-xl"
                >
                  {createProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating profile...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>

                {createProfileMutation.error && (
                  <p className="text-sm text-red-500 text-center">
                    {createProfileMutation.error.message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-500 mt-6">
            You can change your username later in settings
          </p>
        </div>
      </div>
    </main>
  );
}
