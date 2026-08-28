import React from "react";
import {Link} from "react-router-dom";
import {Shell} from "../components/Site";

const feats=[
 ["bi-robot","AI Farming Assistant","Crop guidance, fertilizer suggestions and quick answers."],
 ["bi-cloud-sun","Weather Forecast","Plan field activity with local weather information."],
 ["bi-droplet","Smart Irrigation","Use soil moisture readings to improve water decisions."],
 ["bi-shop","Direct Marketplace","Connect farmer listings with verified buyers."],
 ["bi-pin-map","Land Leasing","Discover productive farmland and flexible leases."],
 ["bi-graph-up","Real-time Updates","Track listings, orders and lease requests."],
 ["bi-shield-check","Secure Payments","Checkout-ready architecture for payment integration."],
 ["bi-headset","24/7 Support","One simple support channel for platform help."]
];

export default function Home(){return <Shell>
<section className="hero"><div className="container"><div className="row align-items-center g-5"><div className="col-lg-6 hero-copy">
<span className="eyebrow">✦ SMART AGRICULTURE PLATFORM</span><h1>Smart Agriculture.<br/><span>Better Future.</span></h1>
<p>Connecting farmers, buyers and landowners through one simple, modern platform built for agriculture.</p>
<div className="d-flex flex-wrap gap-3"><Link className="btn btn-success btn-lg" to="/marketplace">Explore Marketplace <i className="bi bi-arrow-right"/></Link><Link className="btn btn-outline-dark btn-lg" to="/land-leasing">Lease Land</Link></div>
<div className="trust"><span>✓ 1,000+ farmers</span><span>✓ 300+ landowners</span><span>✓ Secure platform</span></div></div>
<div className="col-lg-6"><div className="hero-scene"><div className="sun"/><div className="hill h1"/><div className="hill h2"/><div className="tractor">🚜</div><div className="person">🧑‍🌾</div><div className="crop c1">🌽</div><div className="crop c2">🌾</div>
<div className="float-card one">💧 <b>Smart Irrigation</b><small>45% · Normal</small></div><div className="float-card two">📈 <b>Farm Growth</b><small>+24.8%</small></div></div></div></div></div>
</section>
<section className="section bg-soft"><div className="container"><div className="heading"><span className="eyebrow">EVERYTHING IN ONE PLACE</span><h2>Built for modern agriculture</h2><p>From planting decisions to marketplace orders, every workflow stays connected.</p></div><div className="row g-3">{feats.map(([i,t,d])=><div className="col-6 col-lg-3" key={t}><div className="feature-tile"><span className="feature-icon"><i className={`bi ${i}`}/></span><h6>{t}</h6><p>{d}</p></div></div>)}</div></div></section>
<section className="section"><div className="container"><div className="row align-items-center g-5"><div className="col-lg-7"><span className="eyebrow">ONE CONNECTED ECOSYSTEM</span><h2>Grow, sell, lease and learn — without switching platforms.</h2><p className="lead-muted">Role-based dashboards keep each user focused while the public marketplace remains simple for everyone.</p>
<div className="points"><div>🌾 <span><b>Farmer dashboard</b><small>Crop listings, AI guidance, irrigation and weather.</small></span></div><div>🛒 <span><b>Buyer experience</b><small>Browse, cart, checkout and order history.</small></span></div><div>🏡 <span><b>Landowner tools</b><small>Publish land and manage lease requests.</small></span></div></div></div>
<div className="col-lg-5"><div className="preview"><div className="preview-top"><b>Farm performance</b><span>+18.4%</span></div><div className="bars">{[35,50,45,68,58,78,92].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><div className="preview-bottom"><span>Water saved <b>20 L/m²</b></span><span>Yield <b>+12%</b></span></div></div></div></div></div></section>
<section className="cta"><div className="container d-flex justify-content-between align-items-center flex-wrap gap-3"><div><h2>Make your agriculture workflow smarter.</h2><p>Start with the marketplace or create a role-based account.</p></div><Link className="btn btn-light btn-lg" to="/auth?mode=register">Get Started <i className="bi bi-arrow-right"/></Link></div></section>
</Shell>}