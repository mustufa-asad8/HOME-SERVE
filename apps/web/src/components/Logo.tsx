import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="logo" to="/" aria-label="HomeServe home">
      <span className="logo-mark"><Home size={20} strokeWidth={2.5} /></span>
      {!compact && <span>Home<span>Serve</span></span>}
    </Link>
  );
}
