import { RouterProvider } from 'react-router'
import router from '@app/router'

function AppRouterProvider() {
  return <RouterProvider router={router} />
}

export default AppRouterProvider
