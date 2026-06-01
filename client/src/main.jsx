import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './routes';
import { ToastProvider } from './components/ui';
import './styles/globals.css';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// App component
function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);