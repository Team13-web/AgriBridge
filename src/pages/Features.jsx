import React from 'react';
import { Link } from 'react-router-dom';

export default function Features() {
  const features = [
    { title: 'Land Marketplace', desc: 'Real-estate style land discovery filtered by location, soil type, water source, and acres.', icon: 'bi-map-fill' },
    { title: 'Land Leasing System', desc: 'Seamless lease application submission, duration selection, and landowner approval workflow.', icon: 'bi-journal-check' },
    { title: 'Farmer Produce Store', desc: 'Direct-to-buyer store for rice, chillies, tomatoes, maize, and cotton at fair market prices.', icon: 'bi-shop' },
    { title: 'Secure Payment Gateway', desc: 'Support for UPI, Credit/Debit Cards, Net Banking, and Wallets with receipt downloads.', icon: 'bi-shield-lock-fill' },
    { title: 'Verified Landowners', desc: 'Identity verification for land titles and water reports to build trust.', icon: 'bi-patch-check-fill' },
    { title: 'Application Management', desc: 'Accept, reject, and review farmer applications with customizable lease terms.', icon: 'bi-sliders' },
    { title: 'Analytics & Earnings', desc: 'Detailed earnings metrics, active lease tracking, and transaction history for all roles.', icon: 'bi-bar-chart-line-fill' },
    { title: 'Instant Notifications', desc: 'Real-time alert notifications for lease approvals, payments, and order tracking.', icon: 'bi-bell-fill' }
  ];

  return (
    <div className="features-page py-5">
      <div className="container py-4">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '650px' }}>
          <span className="eyebrow">PLATFORM CAPABILITIES</span>
          <h1 className="fw-black">Everything You Need for AgriTech Growth</h1>
          <p className="text-muted">Explore how AgriBridge connects landowners, farmers, and buyers across India.</p>
        </div>

        <div className="row g-4">
          {features.map((f, i) => (
            <div className="col-lg-3 col-md-6" key={i}>
              <div className="feature-card p-4 d-flex flex-column h-100">
                <div className="bg-success-subtle text-success p-3 rounded-4 d-inline-flex mb-3" style={{ width: '56px' }}>
                  <i className={`bi ${f.icon} fs-3`}></i>
                </div>
                <h5 className="fw-bold mb-2">{f.title}</h5>
                <p className="text-muted small mb-0">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-5 bg-white border rounded-4 text-center shadow-sm">
          <h3 className="fw-bold mb-2">Want to experience these features?</h3>
          <p className="text-muted mb-4">Choose your role to get started with AgriBridge today.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/auth?role=farmer" className="btn btn-success px-4">Register as Farmer</Link>
            <Link to="/auth?role=landowner" className="btn btn-outline-success px-4">Register as Landowner</Link>
          </div>
        </div>
      </div>
    </div>
  );
}