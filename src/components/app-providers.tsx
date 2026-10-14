"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { StoreProvider } from "@/lib/store";
import { IconCheck } from "./icons";

interface Toast {
  id: number;
  message: string;
}

const ToastContext = createContext<{ push: (message: string) => void }>({ push: () => {} });

export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[110px] z-[60] flex flex-col items-center gap-2 px-5">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="anim-pop flex max-w-[420px] items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-white">
              <IconCheck size={13} />
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ToastProvider>{children}</ToastProvider>
    </StoreProvider>
  );
}
