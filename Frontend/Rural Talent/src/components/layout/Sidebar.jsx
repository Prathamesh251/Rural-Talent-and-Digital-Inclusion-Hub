import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  CheckCircle2, 
  Layers, 
  FilePlus2, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  LogOut, 
  UserCheck, 
  Activity,
  User
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'WORKER';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Layers className="text-emerald-400" size={24} />
        </div>
        <div className="brand-text">
          <h2>Rural Talent</h2>
          <span className="brand-badge">{role} HUB</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* EMPLOYER NAVIGATION */}
        {role === 'EMPLOYER' && (
          <>
            <div className="nav-section-title">Operations</div>
            <NavLink to="/employer/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/employer/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} />
              <span>Manage Tasks</span>
            </NavLink>
            <NavLink to="/employer/create-task" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FilePlus2 size={18} />
              <span>Submit New Work</span>
            </NavLink>
          </>
        )}

        {/* WORKER NAVIGATION */}
        {role === 'WORKER' && (
          <>
            <div className="nav-section-title">Workspace</div>
            <NavLink to="/worker/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={18} />
              <span>My Dashboard</span>
            </NavLink>
            <NavLink to="/worker/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} />
              <span>Assignments</span>
            </NavLink>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {role === 'ADMIN' && (
          <>
            <div className="nav-section-title">Administration</div>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={18} />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/admin/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} />
              <span>All Tasks</span>
            </NavLink>
            <NavLink to="/admin/workers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Worker Verification</span>
            </NavLink>
            <NavLink to="/admin/qa" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} />
              <span>Quality Assurance</span>
            </NavLink>
            <NavLink to="/admin/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} />
              <span>Disbursements</span>
            </NavLink>
          </>
        )}

        <div className="nav-section-title">Account</div>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.full_name || 'User'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign Out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
