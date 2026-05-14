import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { name, email, password, confirmPassword } = (body ?? {}) as {
    name?: unknown
    email?: unknown
    password?: unknown
    confirmPassword?: unknown
  }

  if (typeof email !== "string" || typeof password !== "string" || typeof confirmPassword !== "string") {
    return NextResponse.json({ error: "email, password, and confirmPassword are required" }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!EMAIL_RE.test(normalizedEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: typeof name === "string" && name.trim() ? name.trim() : null,
      email: normalizedEmail,
      password: hashed,
    },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ ok: true, user }, { status: 201 })
}
