import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@app/styles/global.css'
import { AppRouterProvider } from '@app/providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouterProvider />
  </StrictMode>,
)
