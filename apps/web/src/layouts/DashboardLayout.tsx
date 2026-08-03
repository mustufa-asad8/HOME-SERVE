import { BarChart3, CalendarDays, ClipboardList, Home, LogOut, Menu, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useApp } from '../lib/AppContext';

export default function DashboardLayout() {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  if (!user) return null;

  const links = user.role === 'customer'
    ? [
        { to: '/app/customer', icon: Home, label: 'Overview' },
        { to: '/app/appointments', icon: CalendarDays, label: 'My appointments' },
      ]
    : user.role === 'provider'
      ? [
          { to: '/app/provider', icon: ClipboardList, label: 'Job operations' },
          { to: '/app/provider#services', icon: Wrench, label: 'Service catalog' },
        ]
      : [
          { to: '/app/admin', icon: BarChart3, label: 'Marketplace control' },
        ];

  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-shell">
      <aside className={open ? 'dashboard-sidebar open' : 'dashboard-sidebar'}>
        <div className="sidebar-top"><Logo /><button className="mobile-menu" onClick={() => setOpen(false)}><X /></button></div>
        <div className="workspace-chip"><span className="avatar">{user.avatar}</span><div><strong>{user.name}</strong><small>{user.role} workspace</small></div></div>
        <nav className="sidebar-nav">
          <span className="sidebar-label">Authorized workspace</span>
          {links.map(({ to, icon: Icon, label }) => <NavLink key={to} to={to} onClick={() => setOpen(false)}><Icon size={19} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-footer"><Link to="/"><Home size={18} /> Marketplace</Link><button onClick={signOut}><LogOut size={18} /> Sign out</button></div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header"><button className="mobile-menu" onClick={() => setOpen(true)}><Menu /></button><div><small>HomeServe</small><strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} operations</strong></div><span className="avatar small">{user.avatar}</span></header>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </div>
  );
}
