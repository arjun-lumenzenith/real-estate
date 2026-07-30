import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/rbac'
import { getAdminLeads } from '@/app/actions/admin-leads'
import { LeadsDashboard } from '@/components/admin/leads-dashboard'

export const metadata: Metadata = {
  title: 'Admin · Leads',
  robots: { index: false, follow: false },
}

// Always render fresh — admin data must never be statically cached.
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/admin/login')

  // Load the first page server-side for a fast initial paint.
  const initial = await getAdminLeads({ page: 1, limit: 10, sortBy: 'createdAt', sortDir: 'desc' })

  return (
    <LeadsDashboard
      initialData={initial.data}
      initialPagination={initial.pagination}
      role={admin.role}
      admin={{ name: admin.name, email: admin.email }}
    />
  )
}
