import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/", "/register", "/login", "/about", "/timeline", "/tracks", "/mentors", "/faq"];
  
  if (pathname.startsWith("/api/auth") || pathname === "/api/register") {
    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname) || pathname.startsWith("/_next/") || pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|html|xml|txt)$/)) {
    // Redirect logged-in users away from login page
    if (isLoggedIn && pathname === "/login" && user?.role) {
      return NextResponse.redirect(new URL(`/dashboard/${user.role.toLowerCase()}`, req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Removed change-password redirections

  // Basic role routing
  if (pathname.startsWith("/dashboard")) {
    const roleStr = user?.role?.toLowerCase();
    
    // If they are not accessing their specific role dashboard
    if (roleStr && !pathname.startsWith(`/dashboard/${roleStr}`)) {
      return NextResponse.redirect(new URL(`/dashboard/${roleStr}`, req.nextUrl));
    }
  }

  return NextResponse.next();
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
