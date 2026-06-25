import type { Metadata } from 'next'
import { DashboardProvider } from '@/components/dashboard/DashboardProvider'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: 'Tavero Partner — Owner Dashboard',
  description: 'Manage your cafe profile, menu, tables, QR ordering, and live operations.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
