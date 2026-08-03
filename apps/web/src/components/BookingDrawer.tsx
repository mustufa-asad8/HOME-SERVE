import { CalendarDays, Check, ChevronRight, Clock, MapPin, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { useApp } from '../lib/AppContext';
import { money } from '../lib/format';

export default function BookingDrawer() {
  const { selectedService, closeBooking, bookService, user } = useApp();
  const minimumDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const [date, setDate] = useState(minimumDate);
  const [time, setTime] = useState('10:30');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedService) {
      setStep(1);
      setError('');
      setAddress('');
      setNotes('');
    }
  }, [selectedService]);

  if (!selectedService || user?.role !== 'customer') return null;

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await bookService({ service: selectedService, date, time, address, notes });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = date >= minimumDate && address.trim().length >= 8;

  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true" aria-label="Book service">
      <button className="drawer-backdrop-click" onClick={closeBooking} aria-label="Close booking" />
      <aside className="booking-drawer">
        <div className="drawer-header"><div><span className="eyebrow">Secure booking</span><h2>{step === 1 ? 'Choose your visit' : 'Review and request'}</h2></div><button className="icon-button" onClick={closeBooking}><X /></button></div>
        <div className="booking-progress"><span className="active">1</span><i /><span className={step === 2 ? 'active' : ''}>2</span></div>
        <div className="drawer-content">
          <div className="booking-service-summary"><img src={selectedService.image} alt="" /><div><small>{selectedService.provider}</small><strong>{selectedService.title}</strong><span>{money(selectedService.price)} · {selectedService.duration}</span></div></div>
          {step === 1 ? (
            <div className="booking-form">
              <label><span><CalendarDays size={17} /> Preferred date</span><input type="date" value={date} min={minimumDate} onChange={(event) => setDate(event.target.value)} /></label>
              <label><span><Clock size={17} /> Arrival window</span><select value={time} onChange={(event) => setTime(event.target.value)}><option value="08:30">8:30 AM</option><option value="10:30">10:30 AM</option><option value="13:30">1:30 PM</option><option value="16:00">4:00 PM</option></select></label>
              <label><span><MapPin size={17} /> Service address</span><textarea required value={address} onChange={(event) => setAddress(event.target.value)} rows={3} placeholder="House, street, area and city" /></label>
              <label><span>Notes for the provider</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Optional access or service details" /></label>
              <div className="availability-note"><Check size={18} /><div><strong>Slot validation happens on the server</strong><span>If another customer takes this provider slot first, HomeServe will ask you to choose another time.</span></div></div>
              <button className="button primary full" disabled={!canContinue} onClick={() => setStep(2)}>Continue <ChevronRight size={18} /></button>
            </div>
          ) : (
            <div className="review-booking">
              <div className="review-row"><span>Date</span><strong>{date}</strong></div><div className="review-row"><span>Arrival</span><strong>{time}</strong></div><div className="review-row"><span>Address</span><strong>{address}</strong></div>
              <div className="price-summary"><div><span>Service estimate</span><strong>{money(selectedService.price)}</strong></div><div><span>Platform fee</span><strong>Included</strong></div><div className="total"><span>Estimated total</span><strong>{money(selectedService.price)}</strong></div></div>
              <div className="safety-card"><ShieldCheck size={22} /><div><strong>Protected by HomeServe</strong><span>The backend derives the provider from the selected service; customers cannot substitute another provider or alter the amount.</span></div></div>
              {error && <div className="auth-error">{error}</div>}
              <button className="button primary full" disabled={submitting} onClick={() => void submit()}>{submitting ? 'Requesting…' : 'Request booking'}</button>
              <button className="button text full" disabled={submitting} onClick={() => setStep(1)}>Back to details</button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
