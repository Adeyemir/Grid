import { createClient } from "~/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully exchanged code for session
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    // If there was an error exchanging the code
    console.error("Error exchanging code for session:", error);
    return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }

  // If there's no code parameter, redirect to login
  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
