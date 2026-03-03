import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // Already logged in → skip login page, go to dashboard
      if (req.auth) {
        return NextResponse.redirect(new URL("/admin/documents", req.url));
      }
      // Not logged in → require gate cookie to see the login page
      const gateCookie = req.cookies.get("htd-admin-gate");
      if (!gateCookie) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // All other /admin routes → require authentication
    if (!req.auth) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
