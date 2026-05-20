import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";


export const config = {
  matcher: [
  "/",
  "/dashboard/:path*",
  "/chat/:path*",
  "/sign-in",
  "/sign-up",
  "/verify/:path*",
]
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect authenticated users away from sign-in/sign-up
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from the dashboard
  if (!token && (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/chat/create-room"))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}
