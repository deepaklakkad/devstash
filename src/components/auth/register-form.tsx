"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function validate(form: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }): string | null {
    if (!form.email || !EMAIL_RE.test(form.email)) return "Please enter a valid email address"
    if (form.password.length < 8) return "Password must be at least 8 characters"
    if (form.password !== form.confirmPassword) return "Passwords do not match"
    return null
  }

  function onSubmit(formData: FormData) {
    setError(null)
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    }

    const clientError = validate(payload)
    if (clientError) {
      setError(clientError)
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data?.error ?? "Could not create account")
          return
        }

        toast.success("Account created", {
          description: "You can now sign in with your email and password.",
        })
        router.push("/sign-in")
        router.refresh()
      } catch {
        setError("Network error. Please try again.")
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
        <Input id="name" name="name" type="text" autoComplete="name" placeholder="Jane Developer" required />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm password</label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          minLength={8}
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      ) : null}

      <Button type="submit" className="w-full h-9" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
