import { Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { login, register } from '../firebase/services/auth.service'
import { Button } from '../components/ui/button'

type AuthMode = 'login' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const isSignup = mode === 'signup'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isSignup) {
        await register(email, password, displayName)
      } else {
        await login(email, password)
      }
      navigate('/app')
    } catch {
      setError(isSignup ? 'We could not create your account. Check your details and try again.' : 'We could not sign you in. Check your email and password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-[#eefafd] px-5 py-8 sm:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#cde6ed] bg-white shadow-[0_18px_50px_rgba(20,93,114,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#20bed0] via-[#1aa6c3] to-[#145d72] p-10 text-white lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between">
          <div className="absolute -bottom-24 -left-16 size-72 rounded-full border-[32px] border-white/15" />
          <div className="relative">
            <Link to="/" className="text-sm font-black tracking-[0.18em] text-[#dff7fb]">FRESHVII</Link>
            <Leaf className="mt-20 text-[#dff7fb]" size={42} />
            <h1 className="mt-6 max-w-sm text-5xl font-black leading-[1.05] text-white">Make room for good food.</h1>
            <p className="mt-5 max-w-sm leading-7 text-[#dff7fb]">Your personal kitchen companion for fresher choices, less waste, and easier meals.</p>
          </div>
          <p className="relative text-sm text-[#dff7fb]">Track it. Rescue it. Enjoy it.</p>
        </section>
        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="text-sm font-black tracking-[0.18em] text-[#145d72]">FRESHVII</Link>
          </div>
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#4f8ca3]">Your kitchen, in sync</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#173d4e]">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            <p className="mt-3 text-[#477d8d]">{isSignup ? 'Start keeping good food in rotation.' : 'Pick up where your kitchen left off.'}</p>
          </div>
          <div className="mb-7 grid grid-cols-2 rounded-2xl bg-[#eaf9fc] p-1">
            <button type="button" onClick={() => { setMode('login'); setError('') }} className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${!isSignup ? 'bg-white text-[#145d72] shadow-sm' : 'text-[#477d8d]'}`}>Sign in</button>
            <button type="button" onClick={() => { setMode('signup'); setError('') }} className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${isSignup ? 'bg-white text-[#145d72] shadow-sm' : 'text-[#477d8d]'}`}>Create account</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#173d4e]">Your name</span>
                <span className="flex items-center gap-3 rounded-xl border border-[#cde6ed] bg-[#f7fcfd] px-4 focus-within:border-[#20bed0]">
                  <UserRound size={18} className="text-[#6f8b95]" />
                  <input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Alex Morgan" className="h-12 min-w-0 flex-1 bg-transparent text-[#173d4e] outline-none placeholder:text-[#7b97a3]" />
                </span>
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#173d4e]">Email address</span>
              <span className="flex items-center gap-3 rounded-xl border border-[#cde6ed] bg-[#f7fcfd] px-4 focus-within:border-[#20bed0]">
                <Mail size={18} className="text-[#6f8b95]" />
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 min-w-0 flex-1 bg-transparent text-[#173d4e] outline-none placeholder:text-[#7b97a3]" />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#173d4e]">Password</span>
              <span className="flex items-center gap-3 rounded-xl border border-[#cde6ed] bg-[#f7fcfd] px-4 focus-within:border-[#20bed0]">
                <LockKeyhole size={18} className="text-[#6f8b95]" />
                <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="h-12 min-w-0 flex-1 bg-transparent text-[#173d4e] outline-none placeholder:text-[#7b97a3]" />
              </span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-[#fff0ef] px-4 py-3 text-sm leading-5 text-[#ad4147]">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="h-12 w-full bg-[#20bed0] text-base text-[#063e4d] hover:bg-[#0db3c8]">
              {isSubmitting ? 'Working...' : isSignup ? 'Create my account' : 'Sign in to FRESHVII'}
            </Button>
          </form>
          <p className="mt-7 text-center text-xs leading-5 text-[#6f8b95]">By continuing, you agree to keep your food data private and yours.</p>
        </section>
      </div>
    </main>
  )
}