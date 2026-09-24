import { ArrowLeft, LogOut, Palette, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../components/ui/button'
import { useTheme } from '../hooks/useTheme'
import { paletteOptions } from '../data/palettes'
import { auth } from '../firebase/config'
import { logout } from '../firebase/services/auth.service'

export function AccountSettingsPage() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const user = auth.currentUser
  const { paletteId, setPalette } = useTheme()

  async function handleSignOut() {
    setIsSigningOut(true)
    await logout()
    navigate('/login')
  }

  return <div className="w-full max-w-3xl space-y-8">
    <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#193b5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
    <div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#193b5a]"><Settings size={16} /> Account settings</p><h1 className="mt-2 text-4xl font-black tracking-tight">Your account</h1><p className="mt-3 text-stone-600">Manage your Freshly account and session.</p></div>
    <section className="rounded-[2rem] border border-[#c6dde5] bg-white p-6 sm:p-8">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#193b5a]"><Palette size={16} /> Color palette</div>
      <p className="mt-2 text-sm text-stone-500">Choose the color mood used across your kitchen.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {paletteOptions.map((option) => <button key={option.id} type="button" aria-pressed={paletteId === option.id} onClick={() => setPalette(option.id)} className="flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors" style={{ borderColor: paletteId === option.id ? option.accent : '#e5e1d5', backgroundColor: paletteId === option.id ? option.header : '#ffffff' }}><span className="size-9 shrink-0 rounded-full" style={{ backgroundColor: option.accent }} /><span><strong className="block text-sm text-stone-800">{option.label}</strong><span className="block text-xs text-stone-500">{option.description}</span></span></button>)}
      </div>
    </section>
    <section className="rounded-[2rem] border border-[#c6dde5] bg-white p-6 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">Signed in as</p><p className="mt-2 text-lg font-bold">{user?.email ?? 'Current account'}</p><Button disabled={isSigningOut} onClick={handleSignOut} variant="destructive" className="mt-8"><LogOut size={17} /> {isSigningOut ? 'Signing out...' : 'Sign out'}</Button></section>
  </div>
}
