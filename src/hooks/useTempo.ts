import { useState, useCallback } from "react";
import { api } from "~/trpc/react";

export type TempoStatus = "idle" | "loading" | "success" | "error";

interface TempoState {
    status: TempoStatus;
    txHash: string | null;
    error: string | null;
}

/**
 * React hook for Arc blockchain interactions.
 *
 * All blockchain calls go through the tRPC router (server-side),
 * where the private key and Arc client live. This hook manages
 * the UI state (loading, success, error, txHash) for each action.
 */
export function useTempo() {
    const [state, setState] = useState<TempoState>({
        status: "idle",
        txHash: null,
        error: null,
    });

    const reset = useCallback(() => {
        setState({ status: "idle", txHash: null, error: null });
    }, []);

    const setLoading = useCallback(() => {
        setState({ status: "loading", txHash: null, error: null });
    }, []);

    const setSuccess = useCallback((txHash: string | null) => {
        setState({ status: "success", txHash, error: null });
    }, []);

    const setError = useCallback((error: string) => {
        setState({ status: "error", txHash: null, error });
    }, []);

    return {
        ...state,
        reset,
        setLoading,
        setSuccess,
        setError,
    };
}
