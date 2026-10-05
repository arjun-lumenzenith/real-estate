import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { validatePassword } from '@/lib/password-policy'

/**
 * One-time, idempotent admin seeding. Public sign-up is disabled, so accounts
 * are created directly through Better Auth's internal adapter (same password
 * hashing as the login flow). Once any admin exists this endpoint is a no-op.
 *
 * Passwords come from ADMIN_EDITOR_PASSWORD / ADMIN_VIEWER_PASSWORD and must
 * satisfy the password policy. If unset, a strong random password is generated
 * and returned exactly once in the response.
 */
function generatePassword() {
  return `${randomBytes(12).toString('base64url')}!7aZ`
}

export async function POST() {
  try {
    const db = getDb()

    const existingAdmins = await db
      .select({ id: user.id })
      .from(user)
      .where(inArray(user.role, ['viewer', 'editor']))
      .limit(1)

    if (existingAdmins.length > 0) {
      return NextResponse.json({
        success: true,
        seeded: false,
        message: 'Admin accounts already exist. No changes made.',
      })
    }

    const accounts = [
      {
        email: process.env.ADMIN_EDITOR_EMAIL || 'admin@realestate.com',
        password: process.env.ADMIN_EDITOR_PASSWORD || generatePassword(),
        name: 'Admin (Editor)',
        role: 'editor' as const,
      },
      {
        email: process.env.ADMIN_VIEWER_EMAIL || 'viewer@realestate.com',
        password: process.env.ADMIN_VIEWER_PASSWORD || generatePassword(),
        name: 'Admin (Viewer)',
        role: 'viewer' as const,
      },
    ]

    for (const acct of accounts) {
      const reason = validatePassword(acct.password, acct.email)
      if (reason) {
        return NextResponse.json(
          { success: false, error: `Password for ${acct.email} rejected: ${reason}` },
          { status: 400 },
        )
      }
    }

    const ctx = await auth.$context
    const created: { email: string; role: string; password: string }[] = []

    for (const acct of accounts) {
      const hash = await ctx.password.hash(acct.password)
      const newUser = await ctx.internalAdapter.createUser({
        email: acct.email.toLowerCase(),
        name: acct.name,
        emailVerified: true,
        role: acct.role,
      })
      await ctx.internalAdapter.linkAccount({
        userId: newUser.id,
        providerId: 'credential',
        accountId: newUser.id,
        password: hash,
      })
      created.push({ email: acct.email, role: acct.role, password: acct.password })
    }

    return NextResponse.json({
      success: true,
      seeded: true,
      message: 'Admin accounts created. Store these passwords now; they are not shown again.',
      accounts: created,
    })
  } catch (error) {
    console.error('[Admin Seed] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to seed admins' }, { status: 500 })
  }
}
