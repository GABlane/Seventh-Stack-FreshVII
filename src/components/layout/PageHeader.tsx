import { Link } from 'react-router'

export function PageHeader() {
  return (
    <header className="border-b border-[#e5e1d5] bg-[#f8f7f2]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <span className="text-sm font-black tracking-[0.18em] text-[#426a5a]">
          FRESHVII
        </span>
        <Link to="/login" className="rounded-full px-3 py-2 text-sm font-bold text-stone-500 transition-colors hover:bg-white hover:text-[#426a5a]">Sign in</Link>
      </div>
    </header>
  )
}
