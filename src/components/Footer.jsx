import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold text-success mb-3">🌿 AgriBridge</h4>
            <p className="text-white-50 small mb-3">
              Connecting Farmers, Landowners & Opportunities. Discover agricultural land, lease properties, and sell produce through a trusted agritech platform.
            </p>
            <div className="d-flex gap-3 text-white-50">
              <i className="bi bi-facebook fs-5"></i>
              <i className="bi bi-twitter-x fs-5"></i>
              <i className="bi bi-linkedin fs-5"></i>
              <i className="bi bi-instagram fs-5"></i>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled small d-grid gap-2">
              <li><Link to="/" className="text-white-50 text-decoration-none">Home</Link></li>
              <li><Link to="/features" className="text-white-50 text-decoration-none">Features</Link></li>
              <li><Link to="/marketplace" className="text-white-50 text-decoration-none">Land Marketplace</Link></li>
              <li><Link to="/buyer/marketplace" className="text-white-50 text-decoration-none">Produce Store</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Roles & Solutions</h6>
            <ul className="list-unstyled small d-grid gap-2">
              <li><Link to="/auth?role=farmer" className="text-white-50 text-decoration-none">For Farmers</Link></li>
              <li><Link to="/auth?role=landowner" className="text-white-50 text-decoration-none">For Landowners</Link></li>
              <li><Link to="/auth?role=buyer" className="text-white-50 text-decoration-none">For Produce Buyers</Link></li>
              <li><Link to="/about" className="text-white-50 text-decoration-none">About Platform</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Support & Contact</h6>
            <p className="text-white-50 small mb-1"><i className="bi bi-geo-alt me-2"></i>Ongole & Vijayawada, AP</p>
            <p className="text-white-50 small mb-1"><i className="bi bi-envelope me-2"></i>support@agribridge.com</p>
            <p className="text-white-50 small"><i className="bi bi-telephone me-2"></i>+91 1800-AGRI-BRIDGE</p>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-white-50">
          <p className="mb-0">© 2026 AgriBridge Inc. All rights reserved.</p>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
