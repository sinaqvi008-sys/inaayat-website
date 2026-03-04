'use client';
import { createContext, useContext, useState } from 'react';

type Toast = { id: number; message: string; type?: 'success' | 'error' };

const ToastCtx = createContext<{
  toasts: Toast[];
  show: (message: string, type?: 'success' | 'error') => void;
}>({ toasts: [], show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function show(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }

  return (
    <ToastCtx.Provider value={{ toasts, show }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-8 right-8 space-y-4 z-[9999]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl text-white text-lg font-bold animate-fade-in-up
              ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}
            `}
          >
            {t.type === 'error' ? '❌' : '✔️'} {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
