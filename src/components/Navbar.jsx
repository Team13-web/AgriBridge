import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const homePath = user ? `/${user.role}/dashboard` : '/';

  return (
    <nav className="site-nav navbar navbar-expand-lg">
      <div className="container">
        <Link className="brand navbar-brand" to={homePath}>
          🌿 Agri<span>Bridge</span>
        </Link>

        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive(homePath)}`} to={homePath}>
                {user ? 'My Dashboard' : 'Home'}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/marketplace')}`} to="/marketplace">Farmland Marketplace</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/buyer/marketplace')}`} to="/buyer/marketplace">Produce Store</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/features')}`} to="/features">Features</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/about')}`} to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/contact')}`} to="/contact">Contact</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-light-green dropdown-toggle d-flex align-items-center gap-2" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="rounded-circle" style={{ width: '28px', height: '28px', objectFit: 'cover' }} />
                  ) : (
                    <i className="bi bi-person-circle fs-5"></i>
                  )}
                  <span>{user.full_name || user.role}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                  <li>
                    <Link className="dropdown-item fw-bold text-success" to={`/${user.role}/dashboard`}>
                      <i className="bi bi-speedometer2 me-2"></i>My Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/${user.role}/profile`}>
                      <i className="bi bi-person-gear me-2"></i>Profile Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider"/></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={onLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/auth?mode=login" className="btn btn-outline-success">Login</Link>
                <Link to="/auth?mode=register" className="btn btn-success">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
