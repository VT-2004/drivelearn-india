import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchSchools } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LiveClock from '../../components/LiveClock';
import AccountMenu from '../../components/AccountMenu';
import SchoolsMap from '../../components/SchoolsMap';
import '../../styles/search.css';

const MAHARASHTRA_CITIES = [
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Chhatrapati Sambhaji Nagar', 'Kolhapur', 'Solapur'
];

const SearchSchools = () => {
  const [searchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || '';

  const [city, setCity] = useState(initialCity);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showMap, setShowMap] = useState(false);

  const { logout } = useAuth();

  const loadSchools = async (params = {}) => {
    setLoading(true);
    try {
      const res = await searchSchools(params);
      setSchools(res.data.schools);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCity) {
      setCity(initialCity);
      loadSchools({ city: initialCity });
    } else {
      loadSchools();
    }
  }, [initialCity]);

  const handleSearch = (e) => {
    e.preventDefault();
    setUserLocation(null);
    setShowMap(false);
    loadSchools({ city: city.trim() || undefined });
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setUserLocation(null);
    setShowMap(false);
    loadSchools({ city: selectedCity });
  };

  const handleUseMyLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Location access is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setCity('');
        setShowMap(true);
        loadSchools({ lat: latitude, lng: longitude, radiusKm: 500 });
        setLocating(false);
      },
      (error) => {
        setLocationError('Could not access your location. Please allow location permission and try again.');
        setLocating(false);
      }
    );
  };

  return (
    <div>
      {/* Red & White Hero */}
      {/* Red & White Hero */}
      <div className="search-hero" style={{ background: '#181A1B', color: '#FFFFFF', padding: '24px 48px 40px' }}>
        {/* Dedicated Top Bar with Profile on Top Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          {/* Promotional Welcome Banner */}
          <div style={{
            background: '#D32F2F',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: '0 2px 10px rgba(211, 47, 47, 0.35)',
          }}>
            <span>🎁 Welcome Offer:</span>
            <span>₹15 introductory wallet bonus credited! 2-Wheeler training starting at affordable rates.</span>
          </div>

          {/* Top Right Controls: Clock + Bookings + Profile Button */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginLeft: 'auto' }}>
            <LiveClock />
            <Link
              to="/learner/bookings"
              className="btn btn-outline"
              style={{
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              📋 My Bookings
            </Link>
            <AccountMenu />
          </div>
        </div>

        <div>
          <h1 style={{ color: '#FFFFFF', fontSize: '32px', margin: '0 0 14px' }}>
            Find Driving & 2-Wheeler Academies
          </h1>

          <form className="search-bar" onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Enter city (e.g. Pune, Mumbai, Nagpur)..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ minWidth: '280px', padding: '12px 16px', borderRadius: '5px', border: '2px solid #D32F2F', fontSize: '15px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ background: '#D32F2F', color: '#FFFFFF', fontWeight: 700 }}>
              Search Academies
            </button>
          </form>

          {/* Quick Maharashtra City Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '14px' }}>
            <span style={{ fontSize: '12px', color: '#BDBDBD', fontWeight: 600 }}>📍 Maharashtra Cities:</span>
            <button
              type="button"
              onClick={() => { setCity(''); loadSchools(); }}
              style={{
                background: city === '' ? '#D32F2F' : 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                padding: '3px 10px',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              All Maharashtra
            </button>
            {MAHARASHTRA_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCitySelect(c)}
                style={{
                  background: city.toLowerCase() === c.toLowerCase() ? '#D32F2F' : 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            className="btn btn-outline near-me-btn"
            style={{ marginTop: '14px', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.6)', padding: '6px 14px', fontSize: '13px' }}
            onClick={handleUseMyLocation}
            disabled={locating}
          >
            📍 {locating ? 'Detecting Location...' : 'Use My GPS Location (Near Me)'}
          </button>
          {locationError && <p style={{ color: '#FF8A80', fontSize: '13px', marginTop: '8px' }}>{locationError}</p>}
        </div>
      </div>

      <div className="search-results">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6B7680', padding: '40px' }}>Loading certified academies...</p>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <p className="results-count" style={{ margin: 0, fontWeight: 600 }}>
                {schools.length} verified academy(s) found {city ? `in ${city}` : 'across Maharashtra'}
                {userLocation && ' near you'}
              </p>
            </div>

            {showMap && schools.length > 0 && (
              <div className="results-map-wrapper">
                <SchoolsMap schools={schools} userLocation={userLocation} />
              </div>
            )}

            {schools.length === 0 ? (
              <div className="empty-state">
                No driving schools found matching your search. Try another city in Maharashtra or click "All Maharashtra".
              </div>
            ) : (
              schools.map((s) => (
                <Link to={`/learner/school/${s.id}`} key={s.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="school-card" style={{ borderLeft: '4px solid #D32F2F', borderRadius: '8px', marginBottom: '14px', background: '#FFFFFF' }}>
                    <div className="school-card-info">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="verified-tag" style={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }}>
                          Verified ✓
                        </span>
                        <span style={{ fontSize: '11px', background: '#FFEBEE', color: '#D32F2F', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          🏍️ 2-Wheeler & Car Training
                        </span>
                      </div>
                      <h3 style={{ margin: '4px 0 6px', fontSize: '18px', color: '#181A1B' }}>{s.name}</h3>
                      <div className="school-card-location" style={{ color: '#5F6368', fontSize: '13px' }}>
                        📍 {s.address}, {s.city}, {s.state}
                      </div>
                      <div className="school-card-desc" style={{ color: '#6B7680', fontSize: '13px', margin: '6px 0 0' }}>
                        {s.description || 'Professional training for 2-wheeler scooter/bike and 4-wheeler licensing.'}
                      </div>
                      {s.distanceKm !== undefined && (
                        <span className="distance-tag" style={{ marginTop: '8px', display: 'inline-block' }}>
                          📍 {s.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <div className="school-card-price" style={{ textAlign: 'right', minWidth: '150px' }}>
                      {s.startingPrice ? (
                        <>
                          <div className="price-value" style={{ color: '#D32F2F', fontWeight: 800, fontSize: '22px' }}>
                            ₹{Number(s.startingPrice).toLocaleString('en-IN')}
                          </div>
                          <div className="price-label" style={{ fontSize: '12px', color: '#5F6368' }}>Starting Package</div>
                          <span style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 600 }}>
                            + ₹15 wallet bonus applied
                          </span>
                        </>
                      ) : (
                        <div className="price-label">Custom Pricing</div>
                      )}
                      {s.avgRating && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#F2B705', fontWeight: 700 }}>
                          ★ {s.avgRating} ({s.reviewCount})
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchSchools;