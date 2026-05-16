import { SignInForm } from "@/components/auth/sign-in-form"

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password",
  OAuthAccountNotLinked: "That email is already linked to a different sign-in method.",
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied.",
  Verification: "The sign-in link is no longer valid.",
  Default: "Could not sign in. Please try again.",
}

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { callbackUrl, error } = await searchParams

  const initialError = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default) : null

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Sign in to continue.
        </p>
      </div>
      <SignInForm callbackUrl={callbackUrl} initialError={initialError} />
    </div>
  )
}
