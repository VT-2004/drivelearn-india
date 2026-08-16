import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchSchools } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LiveClock from '../../components/LiveClock';
import AccountMenu from '../../components/AccountMenu';
import SchoolsMap from '../../components/SchoolsMap';
import '../../styles/search.css';

const SearchSchools = () => {
  const [city, setCity] = useState('');
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
    loadSchools();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setUserLocation(null);
    setShowMap(false);
    loadSchools({ city });
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
      <div className="search-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Find a Driving School</h1>
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Enter your city (e.g. Bangalore)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <button
              className="btn btn-outline near-me-btn"
              style={{ marginTop: '12px', color: 'white', border: '1.5px solid white' }}
              onClick={handleUseMyLocation}
              disabled={locating}
            >
              📍 {locating ? 'Finding your location...' : 'Use My Location (Near Me)'}
            </button>
            {locationError && <p style={{ color: '#F8D7DA', fontSize: '13px', marginTop: '8px' }}>{locationError}</p>}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <LiveClock />
            <AccountMenu />
          </div>
        </div>
      </div>

      <div className="search-results">
        {loading ? (
          <p>Loading schools...</p>
        ) : (
          <>
            <p className="results-count">
              {schools.length} verified school(s) found
              {userLocation && ' near you'}
            </p>

            {showMap && schools.length > 0 && (
              <div className="results-map-wrapper">
                <SchoolsMap schools={schools} userLocation={userLocation} />
              </div>
            )}

            {schools.length === 0 ? (
              <div className="empty-state">
                No schools found{userLocation ? ' within 500km of your location' : ''}. Try a different city or check back soon.
              </div>
            ) : (
              schools.map((s) => (
                <Link to={`/learner/school/${s.id}`} key={s.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="school-card">
                    <div className="school-card-info">
                      <span className="verified-tag">Verified ✓</span>
                      <h3>{s.name}</h3>
                      <div className="school-card-location">{s.address}, {s.city}, {s.state}</div>
                      <div className="school-card-desc">{s.description || 'No description provided.'}</div>
                      {s.distanceKm !== undefined && (
                        <span className="distance-tag">📍 {s.distanceKm} km away</span>
                      )}
                    </div>
                    <div className="school-card-price">
                      {s.startingPrice ? (
                        <>
                          <div className="price-value">₹{Number(s.startingPrice).toLocaleString('en-IN')}</div>
                          <div className="price-label">Starting price</div>
                        </>
                      ) : (
                        <div className="price-label">No courses yet</div>
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