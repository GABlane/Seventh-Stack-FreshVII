import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { AddFoodPage } from './pages/AddFoodPage'
import { ConsumptionPage } from './pages/ConsumptionPage'
import { FoodDetailPage } from './pages/FoodDetailPage'
import { HomePage } from './pages/HomePage'
import { RecipesPage } from './pages/RecipesPage'
import { RescuePage } from './pages/RescuePage'

const router = createBrowserRouter([
  {
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
])

function App() {
  return <RouterProvider router={router} />
}

export default App
