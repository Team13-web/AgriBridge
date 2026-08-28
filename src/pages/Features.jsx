import React from "react";
import {Link} from "react-router-dom";
import {Shell} from "../components/Site";
const data=[
["bi-robot","AI Farming Assistant","Ask about crops, pests, fertilizer planning and daily farm decisions."],
["bi-cloud-sun","Weather Forecast","Five-day weather cards with temperature, humidity, wind and rain probability."],
["bi-droplet-half","Smart Irrigation","Track soil moisture and turn field readings into watering recommendations."],
["bi-shop-window","Marketplace","Search produce, filter categories, add items to cart and checkout."],
["bi-pin-map-fill","Land Leasing","Search land by location, type and area and send lease requests."],
["bi-shield-lock","Secure Payments","Payment-gateway-ready checkout structure for a production backend."],
["bi-clock-history","Real-time Updates","Surface new listings, order changes and lease requests in dashboards."],
["bi-headset","24/7 Support","A unified support layer for agricultural platform questions."]
];
export default function Features(){return <Shell><section className="page-hero"><div className="container text-center"><span className="eyebrow">PLATFORM CAPABILITIES</span><h1>Features that work around the farm.</h1><p>Purpose-built modules for farmers, buyers and landowners.</p></div></section><section className="section"><div className="container"><div className="row g-4">{data.map(([i,t,d],n)=><div className="col-md-6 col-lg-3" key={t}><div className="feature-card"><em>0{n+1}</em><span className="feature-icon"><i className={`bi ${i}`}/></span><h5>{t}</h5><p>{d}</p><Link to={t==="Marketplace"?"/marketplace":t==="Land Leasing"?"/land-leasing":"/"}>Explore <i className="bi bi-arrow-up-right"/></Link></div></div>)}</div></div></section><section className="section bg-soft"><div className="container"><div className="heading"><span className="eyebrow">ROLE-BASED</span><h2>Every user sees the tools they need.</h2></div><div className="roles"><div>🌾<b>Farmer</b><small>Manage crops + AI + irrigation</small></div><div>🛒<b>Buyer</b><small>Browse + cart + orders</small></div><div>🏡<b>Landowner</b><small>Land + lease requests</small></div><div>⚙️<b>Admin</b><small>Users + reports + marketplace</small></div></div></div></section></Shell>}