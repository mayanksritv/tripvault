import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function Notice({ type = 'error', children }) {
  if (!children) return null;
  const Icon = type === 'success' ? CheckCircle2 : type === 'info' ? Info : AlertCircle;
  return (
    <div className={`notice notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={17} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
