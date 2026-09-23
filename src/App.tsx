import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { AddFoodPage } from './pages/AddFoodPage'
import { AccountSettingsPage } from './pages/AccountSettingsPage'
import { AuthPage } from './pages/AuthPage'
import { ConsumptionPage } from './pages/ConsumptionPage'
import { FoodDetailPage } from './pages/FoodDetailPage'
import { HomePage } from './pages/HomePage'
import { InsightsPage } from './pages/InsightsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { RecipesPage } from './pages/RecipesPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { RescuePage } from './pages/RescuePage'

const router = createBrowserRouter([
  { index: true, element: <AuthPage /> },
  { path: 'login', element: <AuthPage /> },
  {
    path: 'app',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'add-food', element: <AddFoodPage /> },
      { path: 'food/:foodId', element: <FoodDetailPage /> },
      { path: 'rescue', element: <RescuePage /> },
      { path: 'recipes', element: <RecipesPage /> },
      { path: 'recipes/:recipeId', element: <RecipeDetailPage /> },
      { path: 'consumption', element: <ConsumptionPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'settings', element: <AccountSettingsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },
  { path: 'add-food', element: <AppLayout />, children: [{ index: true, element: <AddFoodPage /> }] },
  { path: 'food/:foodId', element: <AppLayout />, children: [{ index: true, element: <FoodDetailPage /> }] },
  { path: 'rescue', element: <AppLayout />, children: [{ index: true, element: <RescuePage /> }] },
  { path: 'recipes', element: <AppLayout />, children: [{ index: true, element: <RecipesPage /> }] },
  { path: 'recipes/:recipeId', element: <AppLayout />, children: [{ index: true, element: <RecipeDetailPage /> }] },
  { path: 'consumption', element: <AppLayout />, children: [{ index: true, element: <ConsumptionPage /> }] },
  { path: 'insights', element: <AppLayout />, children: [{ index: true, element: <InsightsPage /> }] },
  { path: 'settings', element: <AppLayout />, children: [{ index: true, element: <AccountSettingsPage /> }] },
  { path: 'notifications', element: <AppLayout />, children: [{ index: true, element: <NotificationsPage /> }] },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
