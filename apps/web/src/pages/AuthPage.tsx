import { ArrowRight, BadgeCheck, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { dashboardPathFor } from '../lib/roles';
import type { Role } from '../lib/types';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isRegister = location.pathname === '/register';
  const { user, login, register, loginDemo } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestedRole = params.get('role') === 'provider' ? 'provider' : 'customer';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: requestedRole as 'customer' | 'provider', city: 'Karachi' });

  useEffect(() => {
    setForm((current) => ({ ...current, role: requestedRole }));
  }, [requestedRole]);

  if (user) return <Navigate to={dashboardPathFor(user.role)} replace />;

  const destination = (role: Role) => {
    const next = params.get('next');
    if (next?.startsWith('/')) return next;
    return dashboardPathFor(role);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const activeUser = isRegister ? await register(form) : await login(form);
      navigate(destination(activeUser.role));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  const useDemo = async (role: Role) => {
    setError('');
    setLoading(true);
    try {
      const activeUser = await loginDemo(role);
      navigate(dashboardPathFor(activeUser.role));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return <section className="auth-page"><div className="container auth-grid"><div className="auth-story"><span className="eyebrow light"><ShieldCheck size={16} /> One account, every service</span><h1>{isRegister ? 'Create a simpler way to care for your home.' : 'Welcome back to a better service experience.'}</h1><p>Book trusted professionals, follow every appointment and keep a useful service history in one secure place.</p><div className="auth-points"><div><BadgeCheck /><span>Vetted provider marketplace</span></div><div><BadgeCheck /><span>Server-enforced appointment updates</span></div><div><BadgeCheck /><span>Separate customer, provider and admin workspaces</span></div></div></div><div className="auth-card"><div className="auth-card-heading"><span className="auth-icon"><UserRound /></span><div><h2>{isRegister ? 'Create your account' : 'Sign in to HomeServe'}</h2><p>{isRegister ? 'Start booking or growing your service business.' : 'Use your account or a seeded demo account.'}</p></div></div><form onSubmit={submit}>{isRegister && <label>Full name<div className="auth-input"><UserRound size={18} /><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ayesha Khan" /></div></label>}<label>Email address<div className="auth-input"><Mail size={18} /><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></div></label><label>Password<div className="auth-input"><LockKeyhole size={18} /><input required minLength={8} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>{isRegister && <div className="auth-row"><label>Account type<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as 'customer' | 'provider' })}><option value="customer">Customer</option><option value="provider">Service provider</option></select></label><label>City<select value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}><option>Karachi</option><option>Lahore</option><option>Islamabad</option></select></label></div>}{error && <div className="auth-error">{error}</div>}<button className="button primary full large" disabled={loading}>{loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={18} /></button></form><div className="auth-switch">{isRegister ? 'Already have an account?' : 'New to HomeServe?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create account'}</Link></div><div className="auth-divider"><span>or use a seeded account</span></div><div className="demo-buttons"><button disabled={loading} onClick={() => void useDemo('customer')}>Customer</button><button disabled={loading} onClick={() => void useDemo('provider')}>Provider</button><button disabled={loading} onClick={() => void useDemo('admin')}>Admin</button></div></div></div></section>;
}
