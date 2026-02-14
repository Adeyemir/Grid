import {
    createClient,
    http,
    publicActions,
    walletActions,
    type Address,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { tempoModerato } from "viem/chains";
import { tempoActions } from "viem/tempo";
import { ALPHA_USD_TOKEN } from "./constants";

/**
 * Creates a configured Tempo client using the provided private key.
 *
 * The client is extended with:
 * - publicActions (readContract, getBlock, etc.)
 * - walletActions (sendTransaction, signMessage, etc.)
 * - tempoActions (token.*, faucet.*, dex.*, etc.)
 *
 * The chain defaults to `tempoModerato` (Tempo testnet) with Alpha USD
 * as the default fee token.
 */
export function createTempoClient(privateKey: `0x${string}`) {
    const account = privateKeyToAccount(privateKey);

    const chain = tempoModerato.extend({
        feeToken: ALPHA_USD_TOKEN,
    });

    const client = createClient({
        account,
        chain,
        transport: http(),
    })
        .extend(publicActions)
        .extend(walletActions)
        .extend(tempoActions());

    return client;
}

export type TempoClient = ReturnType<typeof createTempoClient>;

/**
 * Derive the wallet address from a private key without creating a full client.
 * Useful for displaying the address in the frontend.
 */
export function getAccountFromPrivateKey(
    privateKey: `0x${string}`,
): PrivateKeyAccount {
    return privateKeyToAccount(privateKey);
}
