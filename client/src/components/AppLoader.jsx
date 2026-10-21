import { Compass } from 'lucide-react';

export default function AppLoader({ label = 'Opening your journal…' }) {
  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="loader-orbit"><Compass size={25} /></div>
      <span>{label}</span>
    </div>
  );
}
