import { Outlet } from 'react-router'
import { PageHeader } from './PageHeader'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-stone-50 text-stone-900">
      <PageHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-12 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
