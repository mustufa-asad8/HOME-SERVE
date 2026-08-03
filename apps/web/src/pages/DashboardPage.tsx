import { ArrowRight, CalendarCheck2, Clock3, MapPin, ShieldCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { money, prettyDate } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import ServiceCard from '../components/ServiceCard';

export default function DashboardPage() {
  const { user, appointments, services, loading } = useApp();
  if (!user) return null;

  const sorted = [...appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const upcoming = sorted.filter((item) => ['pending', 'confirmed', 'in_progress', 'completion_requested'].includes(item.status));
  const completed = appointments.filter((item) => item.status === 'completed');
  const next = upcoming[0];
  const totalSpent = completed.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="dashboard-page">
      <div className="page-heading"><div><span className="eyebrow">Customer workspace</span><h1>Welcome, {user.name.split(' ')[0]}.</h1><p>Your dashboard only contains appointments owned by your authenticated customer account.</p></div><Link className="button primary" to="/services">Book a service <ArrowRight size={18} /></Link></div>
      <div className="metric-grid customer-metrics">
        <div className="metric-card"><span className="metric-icon"><CalendarCheck2 /></span><div><small>Upcoming visits</small><strong>{upcoming.length}</strong><span>{next ? `Next: ${prettyDate(next.date)}` : 'Nothing scheduled'}</span></div></div>
        <div className="metric-card"><span className="metric-icon"><WalletCards /></span><div><small>Total completed value</small><strong>{money(totalSpent)}</strong><span>Across {completed.length} completed visit{completed.length === 1 ? '' : 's'}</span></div></div>
      </div>

      <section className="panel next-appointment-panel">
        <div className="panel-heading"><div><span className="eyebrow">Next appointment</span><h2>{next?.serviceTitle ?? 'No upcoming visit'}</h2></div>{next && <StatusBadge status={next.status} />}</div>
        {next ? <><div className="appointment-hero"><div className="appointment-date"><strong>{new Date(`${next.date}T00:00:00`).getDate()}</strong><span>{new Date(`${next.date}T00:00:00`).toLocaleString('en', { month: 'short' })}</span></div><div className="appointment-info"><div><Clock3 size={18} /><span>Arrival window</span><strong>{next.time}</strong></div><div><MapPin size={18} /><span>Service address</span><strong>{next.address}</strong></div></div></div><div className="provider-strip"><span className="avatar">{next.provider.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><small>Assigned provider</small><strong>{next.provider} <ShieldCheck size={15} /></strong></div><Link className="button secondary small" to="/app/appointments">Manage appointment</Link></div></> : <div className="empty-state"><p>Choose a service from the marketplace when you are ready.</p><Link className="button secondary" to="/services">Explore services</Link></div>}
      </section>

      <section className="panel appointments-panel"><div className="panel-heading"><div><span className="eyebrow">Your service records</span><h2>Recent appointments</h2></div><Link className="text-link" to="/app/appointments">View all <ArrowRight size={16} /></Link></div><div className="table-wrap"><table><thead><tr><th>Appointment</th><th>Provider</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead><tbody>{appointments.slice(0, 5).map((item) => <tr key={item.id}><td><strong>{item.serviceTitle}</strong><small>{item.id}</small></td><td>{item.provider}</td><td>{prettyDate(item.date)}<small>{item.time}</small></td><td><StatusBadge status={item.status} /></td><td>{money(item.amount)}</td></tr>)}</tbody></table>{!loading && appointments.length === 0 && <div className="empty-state table-empty"><h3>No appointments yet</h3><p>Your first booking will appear here after the API accepts it.</p></div>}</div></section>

      <section className="dashboard-section"><div className="panel-heading"><div><span className="eyebrow">Available now</span><h2>Book another service</h2></div></div><div className="service-grid compact-grid">{services.slice(0, 3).map((service) => <ServiceCard key={service.id} service={service} compact />)}</div></section>
    </div>
  );
}
