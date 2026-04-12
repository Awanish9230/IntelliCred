import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        className: 'glass-panel text-white border border-white/10',
        style: {
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
