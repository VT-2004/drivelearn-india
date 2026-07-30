import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchSchools } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/search.css';

const SearchSchools = () => {
  const [city, setCity] = useState('');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const { logout } = useAuth();

  const loadSchools = async (cityFilter = '') => {
    setLoading(true);
    try {
      const res = await searchSchools(cityFilter);
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
    loadSchools(city);
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
          </div>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="search-results">
        {loading ? (
          <p>Loading schools...</p>
        ) : (
          <>
            <p className="results-count">{schools.length} verified school(s) found</p>
            {schools.length === 0 ? (
              <div className="empty-state">No schools found. Try a different city or check back soon.</div>
            ) : (
              schools.map((s) => (
                <Link to={`/learner/school/${s.id}`} key={s.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="school-card">
                    <div className="school-card-info">
                      <span className="verified-tag">Verified ✓</span>
                      <h3>{s.name}</h3>
                      <div className="school-card-location">{s.address}, {s.city}, {s.state}</div>
                      <div className="school-card-desc">{s.description || 'No description provided.'}</div>
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
