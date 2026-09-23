import type { ReactNode } from 'react'

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-[#d8d1c0] bg-white px-6 py-12 text-center"><div className="flex size-14 items-center justify-center rounded-2xl bg-[#dce9de] text-[var(--color-primary)]">{icon}</div><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
}
