import NextAuth from "next-auth"
import authConfig from "@/auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  const requiresAuth =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile")

  if (requiresAuth && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href)
    return Response.redirect(signInUrl)
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}
