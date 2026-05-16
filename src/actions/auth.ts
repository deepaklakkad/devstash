"use server"

import { AuthError } from "next-auth"
import { signIn, signOut } from "@/auth"

export type AuthActionResult = { ok: true } | { ok: false; error: string }

export async function signInWithCredentials(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard") || "/dashboard"

  if (!email || !password) {
    return { ok: false, error: "Email and password are required" }
  }

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl })
    return { ok: true }
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, error: "Invalid email or password" }
      }
      return { ok: false, error: "Could not sign in. Please try again." }
    }
    throw error
  }
}

export async function signInWithGitHub(callbackUrl?: string) {
  await signIn("github", { redirectTo: callbackUrl || "/dashboard" })
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" })
}
