import { Bell, ChevronDown, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useApp } from '../lib/AppContext';
import { dashboardPathFor } from '../lib/roles';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, authenticated, notifications, logout } = useApp();
  const unread = notifications.filter((item) => !item.read).length;
  const dashboardPath = user ? dashboardPathFor(user.role) : '/login';

  const signOut = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <span className="location-pill"><MapPin size={16} /> {user?.city ?? 'Pakistan'}<ChevronDown size={14} /></span>
        <nav className={open ? 'main-nav open' : 'main-nav'}>
          <NavLink to="/services" onClick={() => setOpen(false)}>Explore services</NavLink>
          <a href="/#how-it-works" onClick={() => setOpen(false)}>How it works</a>
          <a href="/#trust" onClick={() => setOpen(false)}>Why HomeServe</a>
          <Link to="/register?role=provider" onClick={() => setOpen(false)}>Become a provider</Link>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link className="icon-button notification-button" to={dashboardPath} aria-label="Notifications">
                <Bell size={19} />{unread > 0 && <span>{unread}</span>}
              </Link>
              <div className="profile-menu-wrap">
                <button className="profile-button" type="button" onClick={() => setProfileOpen((value) => !value)}>
                  <span className="avatar small">{user.avatar}</span>
                  <span className="profile-copy"><strong>{user.name.split(' ')[0]}</strong><small>{user.role}</small></span>
                  <ChevronDown size={15} />
                </button>
                {profileOpen && (
                  <div className="profile-menu">
                    <div className="profile-summary"><strong>{authenticated ? 'Signed-in account' : 'Account'}</strong><span>{user.email}</span></div>
                    <Link to={dashboardPath} onClick={() => setProfileOpen(false)}>Open dashboard</Link>
                    <button onClick={signOut}>Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="guest-actions">
              <Link className="button text small" to="/login">Sign in</Link>
              <Link className="button primary small" to="/register">Create account</Link>
            </div>
          )}
          <button className="mobile-menu" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
