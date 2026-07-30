import 'server-only'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export type AdminRole = 'viewer' | 'editor'

export interface AdminSession {
  userId: string
  email: string
  name: string
  role: AdminRole
}

const ADMIN_ROLES: AdminRole[] = ['viewer', 'editor']

function normalizeRole(role: unknown): AdminRole | null {
  if (role === 'viewer' || role === 'editor') return role
  return null
}

/**
 * Returns the current admin session, or null if the user is not
 * authenticated or does not hold an admin role.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const role = normalizeRole((session.user as { role?: string }).role)
  if (!role) return null

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
  }
}

/**
 * Throws if the current user is not an admin (viewer or editor).
 * Returns the admin session otherwise.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession()
  if (!admin) throw new Error('Unauthorized: admin access required')
  return admin
}

/**
 * Throws if the current user is not an editor (read + write/delete).
 * Returns the admin session otherwise.
 */
export async function requireEditor(): Promise<AdminSession> {
  const admin = await requireAdmin()
  if (admin.role !== 'editor') {
    throw new Error('Forbidden: write access requires the editor role')
  }
  return admin
}

export function isAdminRole(role: unknown): boolean {
  return ADMIN_ROLES.includes(role as AdminRole)
}
