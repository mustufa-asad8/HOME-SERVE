import { ArrowUpRight, CalendarCheck2, CircleDollarSign, ShieldAlert, Star, UsersRound, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../lib/AppContext';
import { money, prettyDate } from '../lib/format';
import StatusBadge from '../components/StatusBadge';

export default function AdminPage() {
  const { analytics, appointments, services, updateAppointment } = useApp();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  const counts = useMemo(() => Object.fromEntries((analytics?.users ?? []).map((item) => [item.role, item.count])), [analytics]);
  const statusCounts = useMemo(() => Object.fromEntries((analytics?.appointmentsByStatus ?? []).map((item) => [item.status, item.count])), [analytics]);
  const completed = analytics?.completedJobs ?? 0;
  const totalAppointments = Object.values(statusCounts).reduce((sum, value) => sum + Number(value), 0);

  const exportReport = () => {
    const rows = [
      ['Appointment ID', 'Service', 'Customer', 'Provider', 'Date', 'Time', 'Status', 'Amount'],
      ...appointments.map((item) => [item.id, item.serviceTitle, item.customer, item.provider, item.date, item.time, item.status, String(item.amount)]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `homeserve-appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  return <div className="dashboard-page"><div className="page-heading"><div><span className="eyebrow">Administration</span><h1>Marketplace control.</h1><p>Platform-wide data is available only through the admin-authorized API route.</p></div><button className="button secondary" onClick={exportReport}>Export CSV report</button></div>{error && <div className="auth-error">{error}</div>}
  <div className="metric-grid"><div className="metric-card"><span className="metric-icon"><CircleDollarSign /></span><div><small>Gross completed value</small><strong>{money(analytics?.grossBookingValue ?? 0)}</strong><span><ArrowUpRight size={14} /> Completed appointments only</span></div></div><div className="metric-card"><span className="metric-icon"><CalendarCheck2 /></span><div><small>Completed jobs</small><strong>{completed}</strong><span>{totalAppointments} total appointments</span></div></div><div className="metric-card"><span className="metric-icon"><UsersRound /></span><div><small>Users</small><strong>{Number(counts.customer ?? 0) + Number(counts.provider ?? 0) + Number(counts.admin ?? 0)}</strong><span>{counts.provider ?? 0} providers · {counts.customer ?? 0} customers</span></div></div><div className="metric-card"><span className="metric-icon"><Star /></span><div><small>Active services</small><strong>{analytics?.activeServices ?? services.length}</strong><span>Published marketplace listings</span></div></div></div>
  <div className="dashboard-two-col admin-columns"><section className="panel analytics-panel"><div className="panel-heading"><div><span className="eyebrow">Fulfillment</span><h2>Appointments by status</h2></div></div><div className="status-analytics">{(['pending','confirmed','in_progress','completion_requested','completed','cancelled'] as const).map((status) => <div key={status}><span>{status.replaceAll('_', ' ')}</span><strong>{statusCounts[status] ?? 0}</strong><i style={{ width: `${totalAppointments ? Math.max(4, (Number(statusCounts[status] ?? 0) / totalAppointments) * 100) : 4}%` }} /></div>)}</div></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Authorization</span><h2>Role boundaries</h2></div></div><div className="risk-list"><div><span className="risk-icon good"><UsersRound /></span><div><strong>Customers</strong><p>Book services, cancel eligible visits and confirm provider checkout.</p></div></div><div><span className="risk-icon good"><CalendarCheck2 /></span><div><strong>Providers</strong><p>Manage only assigned jobs and their own service listings.</p></div></div><div><span className="risk-icon warning"><ShieldAlert /></span><div><strong>Administrators</strong><p>View platform analytics and cancel eligible appointments without completing technician work.</p></div></div></div></section></div>
  <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Marketplace operations</span><h2>All appointments</h2></div></div><div className="table-wrap"><table><thead><tr><th>Booking</th><th>Customer</th><th>Provider</th><th>Schedule</th><th>Status</th><th>Value</th><th>Admin action</th></tr></thead><tbody>{appointments.map((item) => <tr key={item.id}><td><strong>{item.serviceTitle}</strong><small>{item.id}</small></td><td>{item.customer}</td><td>{item.provider}</td><td>{prettyDate(item.date)}<small>{item.time}</small></td><td><StatusBadge status={item.status} /></td><td>{money(item.amount)}</td><td>{['pending', 'confirmed'].includes(item.status) ? <button className="button danger small" disabled={updating === item.id} onClick={() => void cancel(item.id)}><XCircle size={15} /> Cancel</button> : <span className="muted-action">No admin transition</span>}</td></tr>)}</tbody></table></div></section></div>;
}
