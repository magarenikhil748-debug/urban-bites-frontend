import type { Metadata } from 'next'
import { AdminProvider } from '@/components/admin/AdminProvider'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata: Metadata = {
  title: 'Tavero Admin',
  description: 'Marketplace cafe approval and operational controls.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  )
}
