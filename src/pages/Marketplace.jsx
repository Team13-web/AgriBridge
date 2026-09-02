import React, { useState, useEffect } from 'react';
import LandCard from '../components/LandCard';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

export default function Marketplace() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [soilType, setSoilType] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadLands();
  }, [search, soilType, locationFilter, maxPrice]);

  const loadLands = async () => {
    setLoading(true);
    const data = await api.getLands({
      search,
      soil_type: soilType,
      location: locationFilter,
      max_price: maxPrice
    });
    setLands(data);
    setLoading(false);
  };

  return (
    <div className="marketplace-page py-5">
      <div className="container">
        {/* Header */}
        <div className="mb-4">
          <span className="eyebrow">AGRICULTURAL REAL ESTATE</span>
          <h1 className="fw-black mb-2">Farmland Leasing Marketplace</h1>
          <p className="text-muted">Find the perfect verified agricultural land for your next farming season.</p>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-lg-4 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-0 text-muted"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control bg-light border-0" 
                  placeholder="Search by location, land name, crop..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <select 
                className="form-select bg-light border-0"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
              >
                <option value="">All Soil Types</option>
                <option value="Black Soil">Black Soil</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Black Cotton Soil">Black Cotton Soil</option>
                <option value="Red Soil">Red Soil</option>
              </select>
            </div>

            <div className="col-lg-3 col-md-6">
              <select 
                className="form-select bg-light border-0"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="Ongole">Ongole</option>
                <option value="Guntur">Guntur</option>
                <option value="Nellore">Nellore</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Kurnool">Kurnool</option>
              </select>
            </div>

            <div className="col-lg-2 col-md-6">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => { setSearch(''); setSoilType(''); setLocationFilter(''); setMaxPrice(''); }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Land Cards Grid */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div className="col-lg-4 col-md-6" key={i}><CardSkeleton /></div>
            ))}
          </div>
        ) : lands.length === 0 ? (
          <EmptyState 
            icon="bi-map" 
            title="No Farmlands Found" 
            description="Try adjusting your search query or soil type filter to find suitable agricultural lands." 
          />
        ) : (
          <div className="row g-4">
            {lands.map(land => (
              <div className="col-lg-4 col-md-6" key={land.id}>
                <LandCard land={land} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}