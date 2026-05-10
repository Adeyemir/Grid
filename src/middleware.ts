import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Note: Authentication is handled client-side by Privy.
  // The dashboard page redirects unauthenticated users to /login automatically.

  // Redirect authenticated users away from login or root if they are logged in
  // Note: We might want to allow them to visit root, but usually dashboard is better.
  // Since root has the Login component which hides itself, maybe we don't force redirect?
  // But user likely wants dashboard.
  /*
  if (user && request.nextUrl.pathname === "/") {
     // Optional: Redirect to dashboard if logged in?
     // Let's keep it simple and just handle /login if someone tries to go there manually
  }
  */

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
