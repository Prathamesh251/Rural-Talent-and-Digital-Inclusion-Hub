import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldCheck, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
        {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
      </div>

      <div className="navbar-right">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search tasks, records..." className="search-input" />
        </div>

        <div className="navbar-badge">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Role: {user?.role || 'Guest'}</span>
        </div>

        <button className="icon-button" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
