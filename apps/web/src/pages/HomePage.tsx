import { ArrowRight, BadgeCheck, Bug, CalendarCheck2, ChevronRight, Droplets, Hammer, Headphones, MapPin, PaintRoller, Search, ShieldCheck, Sparkles, Star, Truck, UsersRound, WalletCards, WashingMachine, Zap } from 'lucide-react';
import { useMemo, useState, type ElementType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { useApp } from '../lib/AppContext';

const iconMap: Record<string, ElementType> = {
  Sparkles,
  WashingMachine,
  Zap,
  Droplets,
  Bug,
  PaintRoller,
  Hammer,
  Truck,
};

export default function HomePage() {
  const navigate = useNavigate();
  const { categories, services, loading } = useApp();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Karachi');
  const featured = useMemo(() => services.slice(0, 4), [services]);

  const search = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-orb one" /><div className="hero-orb two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow light"><BadgeCheck size={16} /> Trusted local professionals</div>
            <h1>Reliable help for every corner of your home.</h1>
            <p>Discover vetted professionals, choose a convenient time, and manage every visit from one simple dashboard.</p>
            <div className="hero-proof">
              <div><span className="proof-avatars"><i>AK</i><i>HS</i><i>SM</i></span><strong>12,000+</strong><small>homes served</small></div>
              <div className="rating-line"><Star size={17} fill="currentColor" /><strong>4.8</strong><span>average rating</span></div>
            </div>
          </div>
          <div className="hero-search-card">
            <div className="search-card-top"><span>What do you need help with?</span><small>Booking takes under 2 minutes</small></div>
            <label className="search-input"><Search size={21} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘AC repair’ or ‘deep cleaning’" /></label>
            <div className="location-select"><MapPin size={20} /><select value={city} onChange={(event) => setCity(event.target.value)}><option>Karachi</option><option>Lahore</option><option>Islamabad</option></select></div>
            <button className="button primary full large" onClick={search}>Find a professional <ArrowRight size={19} /></button>
            <div className="quick-searches"><span>Popular:</span><button onClick={() => setQuery('AC repair')}>AC repair</button><button onClick={() => setQuery('sofa cleaning')}>Sofa cleaning</button><button onClick={() => setQuery('electrician')}>Electrician</button></div>
          </div>
        </div>
      </section>

      <section className="section categories-section">
        <div className="container">
          <div className="section-heading split"><div><span className="eyebrow">Explore by category</span><h2>Everything your home needs</h2></div><Link className="text-link" to="/services">View all services <ArrowRight size={17} /></Link></div>
          <div className="category-grid">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] ?? Sparkles;
              return <Link key={category.id} to={`/services?category=${category.id}`} className="category-card"><span className="category-icon"><Icon size={25} /></span><strong>{category.name}</strong><p>{category.description}</p><span className="category-arrow"><ChevronRight size={18} /></span></Link>;
            })}
          </div>
        </div>
      </section>

      <section className="section muted-section">
        <div className="container">
          <div className="section-heading split"><div><span className="eyebrow">Recommended near you</span><h2>Popular services in Karachi</h2><p>Frequently booked, well-rated and available this week.</p></div><Link className="button secondary" to="/services">Browse marketplace</Link></div>
          {loading && featured.length === 0 ? <div className="empty-state"><p>Loading marketplace services…</p></div> : <div className="service-grid">{featured.map((service) => <ServiceCard key={service.id} service={service} />)}</div>}
        </div>
      </section>

      <section className="section trust-section" id="trust">
        <div className="container trust-grid">
          <div className="trust-visual">
            <div className="trust-image"><img src="https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1200&q=80" alt="Home service professional" /></div>
            <div className="floating-proof"><ShieldCheck size={26} /><div><strong>HomeServe Promise</strong><span>Verified identity · quality follow-up</span></div></div>
          </div>
          <div className="trust-copy"><span className="eyebrow">Safer service, by design</span><h2>Know who is coming—and what happens next.</h2><p>Every visit is supported by clear provider information, appointment tracking, transparent status updates and a real support channel.</p>
            <div className="trust-list"><div><span><BadgeCheck /></span><div><strong>Vetted professionals</strong><p>Profiles, service history and quality indicators before you book.</p></div></div><div><span><WalletCards /></span><div><strong>Upfront estimates</strong><p>See the starting price and approve any extra work before it begins.</p></div></div><div><span><Headphones /></span><div><strong>Human support</strong><p>Help is available throughout the booking, visit and follow-up.</p></div></div></div>
          </div>
        </div>
      </section>

      <section className="section how-section" id="how-it-works">
        <div className="container"><div className="section-heading centered"><span className="eyebrow">Simple from start to finish</span><h2>Book trusted help in three steps</h2></div>
          <div className="steps-grid"><div className="step-card"><span>01</span><Search /><h3>Choose a service</h3><p>Search by need, category or city and compare trusted professionals.</p></div><div className="step-card"><span>02</span><CalendarCheck2 /><h3>Pick a convenient slot</h3><p>Share your address and preferred arrival window with clear pricing.</p></div><div className="step-card"><span>03</span><BadgeCheck /><h3>Track the visit</h3><p>Receive live status updates, notifications and a digital service record.</p></div></div>
        </div>
      </section>

      <section className="section testimonial-section"><div className="container testimonial-grid"><div><span className="eyebrow light">Customer experience</span><h2>“The booking felt clear, fast and genuinely professional.”</h2><div className="quote-rating">{[1,2,3,4,5].map((n) => <Star key={n} size={18} fill="currentColor" />)}</div><p className="quote">I booked sofa cleaning in the morning, got a confirmation quickly, and could see each appointment update from my dashboard. No chasing, no uncertainty.</p><div className="quote-author"><span className="avatar">MR</span><div><strong>Mariam Raza</strong><small>HomeServe customer · Karachi</small></div></div></div><div className="testimonial-stats"><div><strong>4.8/5</strong><span>average customer rating</span></div><div><strong>92%</strong><span>jobs confirmed within 20 minutes</span></div><div><strong>38 min</strong><span>average provider response time</span></div><div><strong>98%</strong><span>appointments with status updates</span></div></div></div></section>

      <section className="provider-cta"><div className="container provider-cta-inner"><div><span className="eyebrow light">Grow with HomeServe</span><h2>Run your service business with less admin.</h2><p>Receive qualified requests, manage your schedule, update jobs and track earnings from one workspace.</p></div><Link className="button light large" to="/register?role=provider">Join as a provider <ArrowRight size={19} /></Link></div></section>
    </>
  );
}
