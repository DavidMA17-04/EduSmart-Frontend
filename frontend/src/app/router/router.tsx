import { createBrowserRouter } from 'react-router'
import AppLayout from '@app/layouts/AppLayout'
import HomePage from '@pages/HomePage'
import NotFoundPage from '@pages/NotFoundPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default router
