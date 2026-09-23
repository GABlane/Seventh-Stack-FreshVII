import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
