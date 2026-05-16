import { auth } from "@/auth"
import { UserAvatar } from "@/components/user-avatar"

export default async function ProfilePage() {
  const session = await auth()
  const user = session?.user

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account details
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user?.name}
              email={user?.email}
              image={user?.image}
              size="lg"
            />
            <div className="min-w-0">
              <p className="text-base font-medium text-foreground truncate">
                {user?.name ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
