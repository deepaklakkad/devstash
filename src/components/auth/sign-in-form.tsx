"use client"

import { useState, useTransition } from "react"
import Link from "next/link"

import { signInWithCredentials, signInWithGitHub } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.48.11-3.08 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.08.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

type SignInFormProps = {
  callbackUrl?: string
  initialError?: string | null
}

export function SignInForm({ callbackUrl, initialError }: SignInFormProps) {
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [pending, startTransition] = useTransition()
  const [githubPending, startGithub] = useTransition()

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signInWithCredentials(formData)
      if (!result.ok) setError(result.error)
    })
  }

  function onGitHub() {
    setError(null)
    startGithub(async () => {
      await signInWithGitHub(callbackUrl)
    })
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full h-9"
        onClick={onGitHub}
        disabled={githubPending || pending}
      >
        <GitHubIcon className="size-4" />
        {githubPending ? "Redirecting..." : "Sign in with GitHub"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form action={onSubmit} className="space-y-3">
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        ) : null}

        <Button type="submit" className="w-full h-9" disabled={pending || githubPending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
