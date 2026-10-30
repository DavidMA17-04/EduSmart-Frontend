import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/features/auth';
import { AppRouter } from '@/app/router/AppRouter';
import { ToastProvider } from '@/shared/ui';
import '@/styles/brand-tokens.css';
import '@/shared/styles/index.css';
import '@/app/styles/admin-theme.css';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export const App = () => {
  const token = useAuthStore(state => state.token);
  const queryClient = useMemo(createQueryClient, [token]);
  useEffect(() => () => queryClient.clear(), [queryClient]);
  return (
  <BrowserRouter>
    <QueryClientProvider key={token ?? 'anonymous'} client={queryClient}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </QueryClientProvider>
  </BrowserRouter>
  );
};

export default App;
