import { BadgeCheck, Clock, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Service } from '../lib/types';
import { money } from '../lib/format';
import { useApp } from '../lib/AppContext';

export default function ServiceCard({ service, compact = false }: { service: Service; compact?: boolean }) {
  const { openBooking, authenticated, user, showToast } = useApp();
  const navigate = useNavigate();

  const book = () => {
    if (!authenticated || !user) {
      navigate('/login?next=/services');
      return;
    }
    if (user.role !== 'customer') {
      showToast('Only customer accounts can create bookings.');
      return;
    }
    openBooking(service);
  };

  return (
    <article className={compact ? 'service-card compact' : 'service-card'}>
      <div className="service-image-wrap">
        <img src={service.image} alt="" className="service-image" />
        <div className="service-rating"><Star size={14} fill="currentColor" /> {service.rating.toFixed(1)} <span>({service.reviews})</span></div>
      </div>
      <div className="service-card-body">
        <div className="service-provider">{service.provider} {service.verified && <BadgeCheck size={16} />}</div>
        <h3>{service.title}</h3>
        {!compact && <p>{service.description}</p>}
        <div className="service-meta"><span><Clock size={15} /> {service.duration}</span><span><MapPin size={15} /> {service.city}</span></div>
        <div className="service-card-footer">
          <div><small>From</small><strong>{money(service.price)}</strong><span>/ {service.priceUnit}</span></div>
          <button className="button primary small" onClick={book}>Book now</button>
        </div>
      </div>
    </article>
  );
}
