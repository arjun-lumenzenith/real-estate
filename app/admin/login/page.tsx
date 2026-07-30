import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/rbac'
import { AdminLoginForm } from '@/components/admin/admin-login-form'

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
}

// Auth session must be read at request time, never prerendered.
export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const admin = await getAdminSession()
  if (admin) redirect('/admin')

  const { redirect: redirectParam } = await searchParams
  const redirectTo = redirectParam && redirectParam.startsWith('/admin') ? redirectParam : '/admin'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <AdminLoginForm redirectTo={redirectTo} />
    </main>
  )
}
