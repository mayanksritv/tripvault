import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);
let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((type, message, duration = 3600) => {
    if (!message) return;
    const id = nextToastId++;
    setToasts((current) => [...current, { id, type, message }].slice(-4));
    timers.current.set(id, setTimeout(() => dismissToast(id), duration));
    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ toasts, toast, dismissToast }), [toasts, toast, dismissToast]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
