// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
  console.log("middleware pathname",req.nextauth.token);
  
    // If user IS logged in and tries to access sign-in/up/verify → send to dashboard
    if (
      req.nextauth.token &&
      (pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/verify"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is NOT logged in and tries to access /dashboard → send to sign-in
    if (!req.nextauth.token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Home ("/") is public, don’t force redirect
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // always allow through; we’ll handle redirects manually
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/verify/:path*"],
};
