import { auth } from "@/auth";
import { NextResponse } from "next/server";

/** Redirects unauthenticated requests to `/admin/*` routes to the login page. */
export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if (!isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
