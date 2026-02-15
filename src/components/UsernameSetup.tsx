"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, AtSign } from "lucide-react";

interface UsernameSetupProps {
  isOpen: boolean;
  onComplete: (username: string) => void;
  privyUserId: string;
  walletAddress?: string;
  suggestedName?: string;
}

export function UsernameSetup({
  isOpen,
  onComplete,
  privyUserId,
  walletAddress,
  suggestedName,
}: UsernameSetupProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(suggestedName ?? "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check username availability
  const checkUsername = api.user.checkUsername.useQuery(
    { username },
    {
      enabled: username.length >= 3,
      refetchOnWindowFocus: false,
    }
  );

  // Create profile mutation
  const createProfile = api.user.createProfile.useMutation({
    onSuccess: (data) => {
      toast.success("Username created!", {
        description: `You are now @${data.username}`,
      });
      onComplete(data.username);
    },
    onError: (error) => {
      toast.error("Failed to create username", {
        description: error.message,
      });
    },
  });

  // Update availability status when query result changes
  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setErrorMessage(null);
      return;
    }

    if (checkUsername.isLoading) {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    if (checkUsername.data) {
      setIsAvailable(checkUsername.data.available);
      setErrorMessage(checkUsername.data.reason ?? null);
    }
  }, [username, checkUsername.isLoading, checkUsername.data]);

  // Clean username as user types
  const handleUsernameChange = (value: string) => {
    // Only allow lowercase letters, numbers, and underscores
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
  };

  const handleSubmit = () => {
    if (!isAvailable || username.length < 3) return;

    // Ensure we have a wallet address - required for receiving payments
    if (!walletAddress) {
      toast.error("Wallet not ready", {
        description: "Please wait for your wallet to be created",
      });
      return;
    }

    createProfile.mutate({
      privyUserId,
      username,
      walletAddress,
      displayName: displayName || username,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="rounded-xl sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Choose Your Username</DialogTitle>
          <DialogDescription className="text-center">
            This is how other Grid users will find and send you money
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="pl-10 pr-10 rounded-xl"
                maxLength={20}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isChecking && (
                  <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                )}
                {!isChecking && isAvailable === true && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
              </div>
            </div>
            {username.length > 0 && username.length < 3 && (
              <p className="text-xs text-amber-600">
                Username must be at least 3 characters
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-rose-600">{errorMessage}</p>
            )}
            {isAvailable && (
              <p className="text-xs text-emerald-600">
                @{username} is available!
              </p>
            )}
            <p className="text-xs text-slate-500">
              Only letters, numbers, and underscores allowed
            </p>
          </div>

          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Display Name <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl"
              maxLength={50}
            />
            <p className="text-xs text-slate-500">
              This is shown on your profile and receipts
            </p>
          </div>

          {/* Preview */}
          {username.length >= 3 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {(displayName || username).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {displayName || username}
                  </p>
                  <p className="text-sm text-emerald-600">@{username}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isAvailable || username.length < 3 || createProfile.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-semibold"
          >
            {createProfile.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </div>
            ) : (
              "Create Username"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
