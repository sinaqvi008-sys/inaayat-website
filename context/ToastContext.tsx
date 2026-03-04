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
      <div className="fixed bottom-20 right-20 space-y-4 z-[99999]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-8 py-6 rounded-xl shadow-2xl text-white text-xl font-bold
              ${t.type === 'error' ? 'bg-red-700' : 'bg-green-700'}
            `}
            style={{ opacity: 1 }}   // force visible
          >
            {t.type === 'error' ? '❌ ERROR:' : '✔️ SUCCESS:'} {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
