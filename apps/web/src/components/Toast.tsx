import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../lib/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return <div className="toast"><CheckCircle2 size={20} /><span>{toast}</span></div>;
}
