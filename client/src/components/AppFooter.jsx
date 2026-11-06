import { ExternalLink } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="app-footer shell">
      <span>© {new Date().getFullYear()} TripVault · Built by Mayank Srivastava</span>
      <a href="https://github.com/mayanksritv" target="_blank" rel="noreferrer">GitHub <ExternalLink size={13} /></a>
    </footer>
  );
}
