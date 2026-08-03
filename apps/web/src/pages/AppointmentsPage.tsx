import { CalendarDays, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { money, prettyDate } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import type { AppointmentStatus } from '../lib/types';

export default function AppointmentsPage() {
  const { appointments, updateAppointment, loading } = useApp();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const relevant = appointments.filter((item) => (tab === 'all' || item.status === tab) && item.serviceTitle.toLowerCase().includes(query.toLowerCase()));

  const cancel = async (id: string) => {
    setUpdating(id);
    setError('');
    try {
      await updateAppointment(id, 'cancelled');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to cancel appointment.');
    } finally {
      setUpdating(null);
    }
  };

  const complete = async (id: string) => {
    setUpdating(id);
    setError('');
    try {
      await updateAppointment(id, 'completed');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to confirm completion.');
    } finally {
      setUpdating(null);
    }
  };

  const tabs: Array<'all' | AppointmentStatus> = ['all', 'pending', 'confirmed', 'in_progress', 'completion_requested', 'completed', 'cancelled'];
  return <div className="dashboard-page"><div className="page-heading"><div><span className="eyebrow">Customer service records</span><h1>My appointments</h1><p>Cancel pending or confirmed bookings, and confirm completion only after the provider requests checkout.</p></div><Link className="button primary" to="/services">Book new service</Link></div>{error && <div className="auth-error">{error}</div>}<section className="panel"><div className="appointments-toolbar"><div className="tabs">{tabs.map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item.replaceAll('_',' ')}</button>)}</div><label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search appointments" /></label></div><div className="table-wrap"><table><thead><tr><th>Service</th><th>Provider</th><th>Schedule</th><th>Status</th><th>Total</th><th>Allowed action</th></tr></thead><tbody>{relevant.map((item) => <tr key={item.id}><td><strong>{item.serviceTitle}</strong><small>{item.id}</small></td><td>{item.provider}</td><td>{prettyDate(item.date)}<small>{item.time}</small></td><td><StatusBadge status={item.status} /></td><td>{money(item.amount)}</td><td>{['pending', 'confirmed'].includes(item.status) ? <button className="button danger small" disabled={updating === item.id} onClick={() => void cancel(item.id)}><XCircle size={15} /> {updating === item.id ? 'Cancelling…' : 'Cancel'}</button> : item.status === 'completion_requested' ? <button className="button primary small" disabled={updating === item.id} onClick={() => void complete(item.id)}>{updating === item.id ? 'Confirming…' : 'Confirm work completed'}</button> : <span className="muted-action">No customer status action</span>}</td></tr>)}</tbody></table>{!loading && relevant.length === 0 && <div className="empty-state table-empty"><CalendarDays size={34} /><h3>No appointments found</h3><p>Try another status or search term.</p></div>}</div></section></div>;
}
