import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Start organizing your developer knowledge in one place.
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
