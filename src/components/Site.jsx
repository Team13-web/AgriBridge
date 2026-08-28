import React from "react";
import {NavLink,Link,useNavigate} from "react-router-dom";

export function Logo(){return <div className="brand"><span>🌱</span> Agri<span>Bridge</span></div>}

export function Navbar(){
  const nav=useNavigate();
  const links=[["/","Home"],["/about","About Us"],["/features","Features"],["/marketplace","Marketplace"],["/land-leasing","Land Leasing"],["/contact","Contact"]];
  return <nav className="navbar navbar-expand-lg sticky-top site-nav"><div className="container">
    <Link className="navbar-brand" to="/"><Logo/></Link>
    <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav"><span className="navbar-toggler-icon"/></button>
    <div id="nav" className="collapse navbar-collapse">
      <ul className="navbar-nav mx-auto">{links.map(([to,t])=><li className="nav-item" key={to}><NavLink className={({isActive})=>`nav-link ${isActive?"active":""}`} to={to}>{t}</NavLink></li>)}</ul>
      <div className="d-flex gap-2"><button className="btn btn-outline-success btn-sm" onClick={()=>nav("/auth?mode=login")}>Login</button><button className="btn btn-success btn-sm" onClick={()=>nav("/auth?mode=register")}>Register</button></div>
    </div>
  </div></nav>
}

export function Footer(){return <footer className="footer"><div className="container py-5"><div className="row g-4">
  <div className="col-lg-5"><h4>🌱 AgriBridge</h4><p className="muted-white">Connecting farmers, buyers and landowners through one modern agriculture platform.</p></div>
  <div className="col-6 col-lg-2"><h6>Platform</h6><Link to="/marketplace">Marketplace</Link><Link to="/land-leasing">Land Leasing</Link><Link to="/features">Features</Link></div>
  <div className="col-6 col-lg-2"><h6>Company</h6><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/auth">Login</Link></div>
  <div className="col-lg-3"><h6>Social</h6><div className="socials"><i className="bi bi-facebook"/><i className="bi bi-instagram"/><i className="bi bi-linkedin"/></div></div>
</div><hr/><small className="muted-white">© 2026 AgriBridge · Responsive React + Bootstrap frontend</small></div></footer>}

export function Shell({children}){return <><Navbar/>{children}<Footer/></>}

export function CropCard({crop,onAdd}){
  return <div className="crop-card card border-0 h-100"><div className={`crop-art ${crop.tone}`}><span>{crop.emoji}</span><b>{crop.category}</b></div>
  <div className="card-body"><h6>{crop.name}</h6><div className="d-flex justify-content-between align-items-center"><span><strong>₹{crop.price}</strong> / {crop.unit}</span><button className="btn btn-sm btn-light-green" onClick={()=>onAdd?.(crop)}><i className="bi bi-cart-plus"/> Add</button></div></div></div>
}

export function Stat({icon,value,label}){return <div className="stat"><span><i className={`bi ${icon}`}/></span><div><b>{value}</b><small>{label}</small></div></div>}

export function Dash({role,title,items,children}){
  const [open,setOpen]=React.useState(false), nav=useNavigate();
  return <div className="dashboard"><aside className={`sidebar ${open?"open":""}`}><div className="side-logo"><Logo/></div><small className="role-label">{role} PORTAL</small>
    <div className="side-links">{items.map(([to,label,icon])=>label==="Logout"?<button key={label} className="side-link logout" onClick={()=>nav("/")}><i className={`bi ${icon}`}/>{label}</button>:<NavLink key={to} to={to} className="side-link" onClick={()=>setOpen(false)}><i className={`bi ${icon}`}/>{label}</NavLink>)}</div>
  </aside><div className="dash-main"><header className="dash-header"><button className="btn btn-light d-lg-none" onClick={()=>setOpen(!open)}><i className="bi bi-list"/></button><div><h5>{title}</h5><small>{role} / AgriBridge</small></div><div className="top-user"><i className="bi bi-bell"/><span>{role[0]}</span></div></header><main className="dash-content">{children}</main></div></div>
}