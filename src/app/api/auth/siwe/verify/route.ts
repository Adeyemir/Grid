import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SiweMessage } from "siwe";
import { createClient } from "~/lib/supabase/server";

/**
 * Verify SIWE signature and authenticate user
 * Creates a new user if they don't exist, or logs them in if they do
 */
export async function POST(request: NextRequest) {
  try {
    const { message, signature } = (await request.json()) as {
      message: string;
      signature: string;
    };

    // Parse and verify the SIWE message
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (!fields.success) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const walletAddress = siweMessage.address.toLowerCase();

    // Get Supabase client
    const supabase = await createClient();

    // Check if user with this wallet address exists
    // For now, we'll create a session without storing in Supabase
    // In production, you'd want to store the wallet address in a users table

    // For MVP, we'll use the wallet address as a pseudo-email
    // This allows the existing Supabase session management to work
    const fakeEmail = `${walletAddress}@wallet.grid`;

    // Try to sign in with the wallet address
    // Note: This is a simplified implementation
    // In production, you'd want a proper user management system
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: walletAddress, // Using address as password for now
    });

    if (sessionError) {
      // User doesn't exist, create a new one
      const { error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: walletAddress,
        options: {
          data: {
            wallet_address: walletAddress,
            auth_method: "wallet",
          },
        },
      });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 },
        );
      }

      // Sign in the newly created user
      const { error: newSignInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: walletAddress,
      });

      if (newSignInError) {
        console.error("Error signing in new user:", newSignInError);
        return NextResponse.json(
          { error: "Failed to sign in" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        address: walletAddress,
        message: "Successfully authenticated",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying SIWE message:", error);
    return NextResponse.json(
      { error: "Failed to verify signature" },
      { status: 500 },
    );
  }
}
