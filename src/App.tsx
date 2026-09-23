import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { AddFoodPage } from './pages/AddFoodPage'
import { AuthPage } from './pages/AuthPage'
import { ConsumptionPage } from './pages/ConsumptionPage'
import { FoodDetailPage } from './pages/FoodDetailPage'
import { HomePage } from './pages/HomePage'
import { RecipesPage } from './pages/RecipesPage'
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
      { path: 'consumption', element: <ConsumptionPage /> },
    ],
  },
  { path: 'add-food', element: <AppLayout />, children: [{ index: true, element: <AddFoodPage /> }] },
  { path: 'food/:foodId', element: <AppLayout />, children: [{ index: true, element: <FoodDetailPage /> }] },
  { path: 'rescue', element: <AppLayout />, children: [{ index: true, element: <RescuePage /> }] },
  { path: 'recipes', element: <AppLayout />, children: [{ index: true, element: <RecipesPage /> }] },
  { path: 'consumption', element: <AppLayout />, children: [{ index: true, element: <ConsumptionPage /> }] },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
