import { NextResponse } from "next/server";
import { generateNonce } from "siwe";

/**
 * Generate a random nonce for SIWE authentication
 * This nonce will be included in the sign-in message to prevent replay attacks
 */
export async function GET() {
  try {
    const nonce = generateNonce();

    return NextResponse.json(
      { nonce },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error generating nonce:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 },
    );
  }
}
