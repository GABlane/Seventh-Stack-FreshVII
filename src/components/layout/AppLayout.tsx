import { NavLink, Outlet } from 'react-router'
import { BarChart3, ChefHat, Home, Plus, Sparkles } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { FoodProvider } from '../../context/FoodContext'
import { RecipeProvider } from '../../context/RecipeContext'

const navigation = [
  { label: 'Home', to: '/app', icon: Home },
  { label: 'Rescue', to: '/app/rescue', icon: Sparkles },
  { label: 'Add Food', to: '/app/add-food', icon: Plus, primary: true },
  { label: 'Recipes', to: '/app/recipes', icon: ChefHat },
  { label: 'Insights', to: '/app/insights', icon: BarChart3 },
]

export function AppLayout() {
  return (
    <FoodProvider>
      <RecipeProvider>
        <div className="flex min-h-svh flex-col bg-[#eaf8fa] text-stone-900">
          <PageHeader />
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-5 py-8 pb-32 sm:px-8 lg:py-12 lg:pb-12">
            <Outlet />
          </main>
          <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-30 rounded-t-[2rem] border-t border-[#d9eef3] bg-[#eaf8fa]/95 px-3 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(45,73,61,0.08)] backdrop-blur lg:static lg:mx-auto lg:w-full lg:max-w-6xl lg:rounded-none lg:border-0 lg:bg-transparent lg:px-8 lg:py-5 lg:shadow-none">
            <div className="mx-auto grid max-w-xl grid-cols-5 items-end lg:w-fit lg:max-w-none lg:grid-cols-none lg:flex lg:justify-center lg:gap-1 lg:rounded-full lg:border lg:border-[#d9eef3] lg:bg-[#eaf8fa] lg:px-2 lg:py-2 lg:shadow-[0_8px_24px_rgba(45,73,61,0.08)]">
              {navigation.map(({ label, to, icon: Icon, primary }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/app'}
                  className={({ isActive }) =>
                    primary
                      ? `relative -top-6 flex flex-col items-center gap-0.5 text-[11px] font-bold text-[#193b5a] transition-transform hover:-translate-y-0.5 focus-visible:outline-none lg:top-0 lg:flex-row lg:gap-2 lg:rounded-full lg:px-3 lg:py-2 lg:text-sm ${isActive ? 'lg:bg-[#d9eef3] lg:text-[#193b5a]' : 'lg:text-[#193b5a] lg:hover:bg-[#eaf2eb]'}`
                      : `flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193b5a] lg:flex-row lg:gap-2 lg:px-3 lg:text-sm ${isActive ? 'text-[#193b5a]' : 'text-stone-500 hover:text-[#193b5a]'}`
                  }
                >
                  {primary
                    ? <span className="flex size-12 items-center justify-center rounded-[1.1rem] border-4 border-[#eaf8fa] bg-[#193b5a] text-[#ffe167] shadow-[0_6px_15px_rgba(66,106,90,0.28)] lg:size-7 lg:rounded-lg lg:border-0 lg:bg-[#193b5a] lg:text-[#ffe167] lg:shadow-none"><Icon size={23} strokeWidth={2.5} className="lg:size-4" /></span>
                    : <Icon size={20} strokeWidth={2.2} />
                  }
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
