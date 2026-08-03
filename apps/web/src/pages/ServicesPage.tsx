import { SlidersHorizontal, Search, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { useApp } from '../lib/AppContext';

export default function ServicesPage() {
  const [params, setParams] = useSearchParams();
  const { categories, services, loading, refreshData } = useApp();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [city, setCity] = useState(params.get('city') ?? 'all');
  const [sort, setSort] = useState('recommended');
  const [minimumRating, setMinimumRating] = useState(false);

  const filtered = useMemo(() => {
    let result = services.filter((service) => {
      const searchMatch = `${service.title} ${service.provider} ${service.description}`.toLowerCase().includes(query.toLowerCase());
      return service.isActive && searchMatch && (!minimumRating || service.rating >= 4.5) && (category === 'all' || service.category === category) && (city === 'all' || service.city === city);
    });
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [query, category, city, sort, services, minimumRating]);

  const reset = () => { setQuery(''); setCategory('all'); setCity('all'); setSort('recommended'); setMinimumRating(false); setParams({}); };

  return (
    <section className="marketplace-page">
      <div className="marketplace-hero"><div className="container"><span className="eyebrow light">HomeServe marketplace</span><h1>Find the right professional for the job.</h1><p>Live services from the HomeServe API, with provider ownership and pricing from the database.</p><label className="marketplace-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services or providers" /></label></div></div>
      <div className="container marketplace-layout">
        <aside className="filter-panel"><div className="filter-title"><strong><SlidersHorizontal size={18} /> Filters</strong><button onClick={reset}>Reset</button></div><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>City<select value={city} onChange={(event) => setCity(event.target.value)}><option value="all">All cities</option><option>Karachi</option><option>Lahore</option><option>Islamabad</option></select></label><div className="filter-block"><span>Minimum rating</span><button className={minimumRating ? "rating-filter active" : "rating-filter"} onClick={() => setMinimumRating((value) => !value)}><Star size={16} fill="currentColor" /> 4.5 and above</button></div></aside>
        <div className="marketplace-results"><div className="results-toolbar"><div><strong>{filtered.length} services</strong><span>loaded from the backend</span></div><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
          {(query || category !== 'all' || city !== 'all' || minimumRating) && <div className="active-filters">{query && <button onClick={() => setQuery('')}>{query}<X size={14} /></button>}{category !== 'all' && <button onClick={() => setCategory('all')}>{categories.find((item) => item.id === category)?.name}<X size={14} /></button>}{city !== 'all' && <button onClick={() => setCity('all')}>{city}<X size={14} /></button>}{minimumRating && <button onClick={() => setMinimumRating(false)}>4.5+ rating<X size={14} /></button>}</div>}
          {loading && services.length === 0 ? <div className="empty-state"><p>Loading services…</p></div> : filtered.length ? <div className="service-grid marketplace-grid">{filtered.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : <div className="empty-state"><Search size={36} /><h3>No matching services</h3><p>Try removing a filter or refresh the marketplace.</p><button className="button secondary" onClick={() => void refreshData()}>Refresh services</button></div>}
        </div>
      </div>
    </section>
  );
}
