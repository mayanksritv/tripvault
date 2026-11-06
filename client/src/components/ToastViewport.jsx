import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions text">
      {toasts?.map((item) => {
        const Icon = item.type === 'success' ? CheckCircle2 : item.type === 'info' ? Info : AlertCircle;
        return (
          <div className={`toast toast-${item.type}`} key={item.id} role={item.type === 'error' ? 'alert' : 'status'}>
            <Icon size={18} aria-hidden="true" />
            <span>{item.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => dismissToast(item.id)}><X size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}
