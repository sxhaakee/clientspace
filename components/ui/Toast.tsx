'use client';
import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#18181B',
          color: '#FAFAF8',
          border: '1px solid #2A2A2E',
          borderRadius: '0px',
          fontSize: '13px',
          fontFamily: 'DM Sans, sans-serif',
          padding: '14px 18px',
        },
        success: {
          iconTheme: {
            primary: '#C8F04B',
            secondary: '#18181B',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FAFAF8',
          },
        },
      }}
    />
  );
}
