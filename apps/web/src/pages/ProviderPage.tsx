import { CalendarDays, Check, Clock3, DollarSign, MapPin, Plus, Star, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useApp } from '../lib/AppContext';
import { money, prettyDate } from '../lib/format';
import StatusBadge from '../components/StatusBadge';

const emptyService = { category: 'cleaning', title: '', description: '', city: 'Karachi', price: 1500, price_unit: 'visit', duration_minutes: 60, image_url: '' };

export default function ProviderPage() {
  const { user, appointments, providerServices, categories, updateAppointment, createService } = useApp();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [savingService, setSavingService] = useState(false);
  if (!user) return null;

  const completed = appointments.filter((item) => item.status === 'completed');
  const active = appointments.filter((item) => ['pending', 'confirmed', 'in_progress', 'completion_requested'].includes(item.status));
  const revenue = completed.reduce((sum, item) => sum + item.amount, 0);
  const rating = providerServices[0]?.rating ?? 0;

  const transition = async (id: string, status: 'confirmed' | 'in_progress' | 'completion_requested' | 'cancelled') => {
    setUpdating(id);
    setError('');
    try {
      await updateAppointment(id, status);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update appointment.');
    } finally {
      setUpdating(null);
    }
  };

  const submitService = async (event: FormEvent) => {
    event.preventDefault();
    setSavingService(true);
    setError('');
    try {
      await createService(serviceForm);
      setServiceForm({ ...emptyService, city: user.city, category: categories[0]?.id ?? 'cleaning' });
      setShowServiceForm(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to publish service.');
    } finally {
      setSavingService(false);
    }
  };

  return <div className="dashboard-page"><div className="page-heading"><div><span className="eyebrow">Provider workspace</span><h1>{user.name} operations.</h1><p>Only jobs assigned to your provider ID are returned by the API.</p></div><button className="button primary" onClick={() => setShowServiceForm((value) => !value)}>{showServiceForm ? <X size={17} /> : <Plus size={17} />} {showServiceForm ? 'Close form' : 'Add service'}</button></div>{error && <div className="auth-error">{error}</div>}
  {showServiceForm && <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Marketplace listing</span><h2>Publish a provider-owned service</h2></div></div><form className="provider-service-form" onSubmit={submitService}><label>Title<input required minLength={3} value={serviceForm.title} onChange={(event) => setServiceForm({ ...serviceForm, title: event.target.value })} /></label><label>Category<select value={serviceForm.category} onChange={(event) => setServiceForm({ ...serviceForm, category: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>City<input required value={serviceForm.city} onChange={(event) => setServiceForm({ ...serviceForm, city: event.target.value })} /></label><label>Price<input required type="number" min="1" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: Number(event.target.value) })} /></label><label>Duration (minutes)<input required type="number" min="15" value={serviceForm.duration_minutes} onChange={(event) => setServiceForm({ ...serviceForm, duration_minutes: Number(event.target.value) })} /></label><label>Price unit<input required value={serviceForm.price_unit} onChange={(event) => setServiceForm({ ...serviceForm, price_unit: event.target.value })} /></label><label className="form-span">Description<textarea required minLength={20} rows={3} value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} /></label><label className="form-span">Image URL<input type="url" value={serviceForm.image_url} onChange={(event) => setServiceForm({ ...serviceForm, image_url: event.target.value })} placeholder="Optional https://…" /></label><button className="button primary" disabled={savingService}>{savingService ? 'Publishing…' : 'Publish service'}</button></form></section>}
  <div className="metric-grid"><div className="metric-card"><span className="metric-icon"><DollarSign /></span><div><small>Completed booking value</small><strong>{money(revenue)}</strong><span>{completed.length} completed jobs</span></div></div><div className="metric-card"><span className="metric-icon"><CalendarDays /></span><div><small>Active jobs</small><strong>{active.length}</strong><span>Pending through customer confirmation</span></div></div><div className="metric-card"><span className="metric-icon"><Star /></span><div><small>Provider rating</small><strong>{rating.toFixed(1)}</strong><span>From database profile</span></div></div><div className="metric-card"><span className="metric-icon"><Clock3 /></span><div><small>Listed services</small><strong>{providerServices.length}</strong><span>Owned by this provider account</span></div></div></div>
  <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Assigned queue</span><h2>Requests and active jobs</h2></div></div><div className="job-list">{appointments.map((job) => <article key={job.id} className="job-card"><div className="job-card-top"><div><strong>{job.serviceTitle}</strong><small>{job.id} · {job.customer}</small></div><StatusBadge status={job.status} /></div><div className="job-details"><span><CalendarDays size={16} /> {prettyDate(job.date)}</span><span><Clock3 size={16} /> {job.time}</span><span><MapPin size={16} /> {job.address}</span></div><div className="job-actions"><strong>{money(job.amount)}</strong><div>{job.status === 'pending' && <><button className="button primary small" disabled={updating === job.id} onClick={() => void transition(job.id, 'confirmed')}><Check size={16} /> Confirm</button><button className="button danger small" disabled={updating === job.id} onClick={() => void transition(job.id, 'cancelled')}>Decline</button></>}{job.status === 'confirmed' && <><button className="button primary small" disabled={updating === job.id} onClick={() => void transition(job.id, 'in_progress')}>Start job</button><button className="button danger small" disabled={updating === job.id} onClick={() => void transition(job.id, 'cancelled')}>Cancel</button></>}{job.status === 'in_progress' && <button className="button primary small" disabled={updating === job.id} onClick={() => void transition(job.id, 'completion_requested')}>Request customer completion</button>}</div></div></article>)}{appointments.length === 0 && <div className="empty-state"><h3>No assigned jobs</h3><p>New customer bookings for your services will appear here.</p></div>}</div></section>
  <section className="panel" id="services"><div className="panel-heading"><div><span className="eyebrow">Service catalog</span><h2>Your database-backed services</h2></div></div><div className="provider-service-list">{providerServices.map((service) => <div key={service.id}><span className="service-mini-image"><img src={service.image} alt="" /></span><div><strong>{service.title}</strong><small>{service.categoryName} · {service.duration}</small></div><span className="status-badge confirmed">Active</span><strong>{money(service.price)}</strong></div>)}{providerServices.length === 0 && <div className="empty-state"><p>Publish your first service using the form above.</p></div>}</div></section></div>;
}
