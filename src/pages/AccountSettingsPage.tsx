import { ArrowLeft, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../components/ui/button'
import { auth } from '../firebase/config'
import { logout } from '../firebase/services/auth.service'

export function AccountSettingsPage() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const user = auth.currentUser

  async function handleSignOut() {
    setIsSigningOut(true)
    await logout()
    navigate('/login')
  }

  return <div className="w-full max-w-3xl space-y-8">
    <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#193b5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
    <div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#193b5a]"><Settings size={16} /> Account settings</p><h1 className="mt-2 text-4xl font-black tracking-tight">Your account</h1><p className="mt-3 text-stone-600">Manage your FRESHVII account and session.</p></div>
    <section className="rounded-[2rem] border border-[#c6dde5] bg-white p-6 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">Signed in as</p><p className="mt-2 text-lg font-bold">{user?.email ?? 'Current account'}</p><Button disabled={isSigningOut} onClick={handleSignOut} variant="destructive" className="mt-8"><LogOut size={17} /> {isSigningOut ? 'Signing out...' : 'Sign out'}</Button></section>
  </div>
}
