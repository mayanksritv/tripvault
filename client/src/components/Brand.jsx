import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Brand({ light = false, compact = false }) {
  return (
    <Link className={`brand${light ? ' brand-light' : ''}${compact ? ' brand-compact' : ''}`} to="/" aria-label="TripVault home">
      <span className="brand-mark"><Compass size={compact ? 18 : 20} strokeWidth={2.1} /></span>
      <span className="brand-name">TripVault<span className="brand-period">.</span></span>
    </Link>
  );
}
