import { NavLink, Outlet } from 'react-router'
import { BarChart3, ChefHat, Home, Plus, Sparkles } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { FoodProvider } from '../../context/FoodContext'
import { RecipeProvider } from '../../context/RecipeContext'

const navigation = [
  { label: 'Home', to: '/app', icon: Home },
  { label: 'Rescue', to: '/app/rescue', icon: Sparkles },
  { label: 'Add food', to: '/app/add-food', icon: Plus },
  { label: 'Recipes', to: '/app/recipes', icon: ChefHat },
  { label: 'Insights', to: '/app/insights', icon: BarChart3 },
]

export function AppLayout() {
  return (
    <FoodProvider>
      <RecipeProvider>
        <div className="flex min-h-svh flex-col bg-[#eefafd] text-stone-900">
          <PageHeader />
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-5 py-8 pb-28 sm:px-8 lg:py-12 lg:pb-12">
            <Outlet />
          </main>
          <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#cde6ed] bg-[#eefafd]/95 px-3 py-3 backdrop-blur lg:static lg:mx-auto lg:w-full lg:max-w-6xl lg:border-0 lg:bg-transparent lg:px-8 lg:py-5">
            <div className="mx-auto flex max-w-xl items-center justify-between lg:max-w-none lg:justify-start lg:gap-2">
              {navigation.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/app'}
                  className={({ isActive }) =>
                    `flex min-w-14 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition-colors lg:flex-row lg:gap-2 lg:text-sm ${isActive ? 'bg-[#dce9de] text-[#426a5a]' : 'text-stone-500 hover:bg-white hover:text-stone-800'}`
                  }
                >
                  <Icon size={18} strokeWidth={2.2} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </RecipeProvider>
    </FoodProvider>
  )
}
