import React, { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page py-5">
      <div className="container">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '600px' }}>
          <span className="eyebrow">GET IN TOUCH</span>
          <h1 className="fw-black mb-2">We'd Love to Hear From You</h1>
          <p className="text-muted">Have questions about land leasing, produce listing, or technical support?</p>
        </div>

        <div className="row g-5">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-4">Contact Information</h5>
              
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-success-subtle text-success p-3 rounded-circle">
                  <i className="bi bi-geo-alt-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Headquarters</h6>
                  <small className="text-muted">Ongole & Vijayawada, Andhra Pradesh, India</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-success-subtle text-success p-3 rounded-circle">
                  <i className="bi bi-envelope-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Email Support</h6>
                  <small className="text-muted">support@agribridge.com</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="bg-success-subtle text-success p-3 rounded-circle">
                  <i className="bi bi-telephone-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Toll-Free Helpline</h6>
                  <small className="text-muted">+91 1800-AGRI-BRIDGE</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-4">Send Us a Message</h5>
              
              {submitted ? (
                <div className="alert alert-success rounded-4 p-4 my-3 text-center">
                  <i className="bi bi-check-circle-fill fs-1 text-success d-block mb-2"></i>
                  <h5 className="fw-bold">Thank You!</h5>
                  <p className="mb-0">Your message has been sent successfully. Our support team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Your Name</label>
                    <input type="text" required className="form-control" placeholder="Ramesh Babu" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email Address</label>
                    <input type="email" required className="form-control" placeholder="ramesh@gmail.com" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Subject</label>
                    <input type="text" required className="form-control" placeholder="Lease inquiry / Technical help" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Message</label>
                    <textarea required className="form-control" rows="4" placeholder="How can we assist you?"></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-success btn-lg px-4">
                      Submit Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}