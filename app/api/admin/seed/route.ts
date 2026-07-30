import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

/**
 * One-time, idempotent admin seeding.
 *
 * Creates two admin accounts using Better Auth's own sign-up API (so the
 * password hashing matches the login flow), then promotes them to the
 * appropriate admin roles. Once any admin exists this endpoint becomes a
 * no-op, so it is safe to call multiple times.
 *
 * Credentials can be overridden with environment variables; otherwise the
 * documented defaults are used (change these after first login).
 */
const EDITOR_EMAIL = process.env.ADMIN_EDITOR_EMAIL || 'admin@realestate.com'
const EDITOR_PASSWORD = process.env.ADMIN_EDITOR_PASSWORD || 'Admin@12345'
const VIEWER_EMAIL = process.env.ADMIN_VIEWER_EMAIL || 'viewer@realestate.com'
const VIEWER_PASSWORD = process.env.ADMIN_VIEWER_PASSWORD || 'Viewer@12345'

export async function POST() {
  try {
    const db = getDb()

    // Already seeded? No-op.
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
      { email: EDITOR_EMAIL, password: EDITOR_PASSWORD, name: 'Admin (Editor)', role: 'editor' as const },
      { email: VIEWER_EMAIL, password: VIEWER_PASSWORD, name: 'Admin (Viewer)', role: 'viewer' as const },
    ]

    const created: { email: string; role: string }[] = []

    for (const acct of accounts) {
      // Create the user through Better Auth so the password hash is valid.
      try {
        await auth.api.signUpEmail({
          body: { email: acct.email, password: acct.password, name: acct.name },
        })
      } catch (err) {
        // If the user already exists (created but not yet promoted), continue to role update.
        console.log('[v0] admin seed signup note:', (err as Error)?.message)
      }

      // Promote to the admin role.
      await db.update(user).set({ role: acct.role }).where(eq(user.email, acct.email))
      created.push({ email: acct.email, role: acct.role })
    }

    return NextResponse.json({
      success: true,
      seeded: true,
      message: 'Admin accounts created.',
      accounts: created,
    })
  } catch (error) {
    console.error('[Admin Seed] Error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || 'Failed to seed admins' },
      { status: 500 }
    )
  }
}
