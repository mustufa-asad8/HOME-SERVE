import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Trusted home services, transparent pricing and accountable professionals—managed in one place.</p>
          <div className="socials"><a href="#"><Instagram size={18} /></a><a href="#"><Facebook size={18} /></a><a href="#"><Linkedin size={18} /></a></div>
        </div>
        <div><h4>Customers</h4><a href="/services">Browse services</a><a href="#how-it-works">How it works</a><a href="/app">My bookings</a><a href="#">Safety</a></div>
        <div><h4>Professionals</h4><a href="/app/provider">Join HomeServe</a><a href="/app/provider">Provider dashboard</a><a href="#">Partner standards</a><a href="#">Help center</a></div>
        <div><h4>Contact</h4><span><Phone size={16} /> 021 111 HOME</span><span><Mail size={16} /> support@homeserve.local</span><span><MapPin size={16} /> Karachi, Pakistan</span></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 HomeServe. Built as a production-ready internship project.</span><div><a href="#">Privacy</a><a href="#">Terms</a></div></div>
    </footer>
  );
}
