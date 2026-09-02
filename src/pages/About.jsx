import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="about-page py-5">
      <div className="container">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '650px' }}>
          <span className="eyebrow">OUR MISSION</span>
          <h1 className="fw-black mb-3">Empowering Agriculture Through Digital Trust</h1>
          <p className="text-muted leading-relaxed">
            AgriBridge is built to solve land underutilization and produce market inefficiencies across India by providing transparent leasing and direct produce trading.
          </p>
        </div>

        <div className="row g-4 my-5 align-items-center">
          <div className="col-lg-6">
            <h3 className="fw-bold mb-3">Why AgriBridge?</h3>
            <p className="text-muted leading-relaxed mb-4">
              Farmers often struggle to find fertile land for lease with fair contracts, while landowners face difficulty verifying trustworthy tenants. AgriBridge bridges this gap with Cloud-hosted technology, verified records, and integrated digital payment solutions.
            </p>
            <div className="row g-3">
              <div className="col-6">
                <div className="border-start border-success border-4 ps-3">
                  <h4 className="fw-bold text-success mb-1">100%</h4>
                  <small className="text-muted">Verified Title Deeds</small>
                </div>
              </div>
              <div className="col-6">
                <div className="border-start border-success border-4 ps-3">
                  <h4 className="fw-bold text-success mb-1">Zero</h4>
                  <small className="text-muted">Middleman Exploitation</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <img 
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800" 
              alt="Farming field" 
              className="img-fluid rounded-4 shadow-md"
            />
          </div>
        </div>

        <div className="p-5 bg-white border rounded-4 shadow-sm text-center">
          <h3 className="fw-bold mb-3">Join the Digital Agriculture Movement</h3>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
            Discover land, list property, or buy fresh farm produce online with complete peace of mind.
          </p>
          <Link to="/auth?mode=register" className="btn btn-success btn-lg px-4">
            Get Started with AgriBridge
          </Link>
        </div>
      </div>
    </div>
  );
}