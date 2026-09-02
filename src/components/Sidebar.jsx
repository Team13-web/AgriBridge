import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ role, items, isOpen, onClose, onLogout }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header d-flex justify-content-between align-items-center">
        <Link to="/" className="brand text-decoration-none">
          🌿 Agri<span>Bridge</span>
        </Link>
        <button className="btn-close d-lg-none" onClick={onClose}></button>
      </div>

      <div className="px-3 pt-3">
        <span className="eyebrow text-uppercase w-100 justify-content-center">
          {role} Workspace
        </span>
      </div>

      <div className="sidebar-menu">
        {items.map(([path, label, icon]) => {
          const isActive = location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={`bi ${icon} fs-5`}></i>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-top border-light">
        <button className="sidebar-item text-danger" onClick={onLogout}>
          <i className="bi bi-box-arrow-right fs-5"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
