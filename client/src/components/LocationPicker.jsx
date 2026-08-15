import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // Center of India

const RecenterMap = ({ position }) => {
  const map = useMap();
  if (position) {
    map.setView(position, 15);
  }
  return null;
};

const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const LocationPicker = ({ value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const position = value && value[0] && value[1] ? value : null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Location search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSearch();
    }
  };

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    onChange(lat, lon);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleMapClick = (latlng) => {
    onChange(latlng[0], latlng[1]);
  };

  return (
    <div className="location-picker">
      <label>Search for your address</label>
      <div className="location-search-row">
        <input
          type="text"
          placeholder="Type an address, area, or landmark..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <button type="button" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22', whiteSpace: 'nowrap' }} onClick={() => handleSearch()} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="location-search-results">
          {searchResults.map((r, idx) => (
            <div key={idx} className="location-search-result-item" onClick={() => handleSelectResult(r)}>
              {r.display_name}
            </div>
          ))}
        </div>
      )}

      <div className="leaflet-map-container">
        <MapContainer center={position || DEFAULT_CENTER} zoom={position ? 15 : 5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleMapClick} />
          {position && <Marker position={position} />}
          <RecenterMap position={position} />
        </MapContainer>
      </div>

      <p className="location-hint">
        Search for your address above, or click directly on the map to drop a pin at your school's exact location.
      </p>

      {position && (
        <span className="selected-location-badge">
          ✓ Location selected ({position[0].toFixed(5)}, {position[1].toFixed(5)})
        </span>
      )}
    </div>
  );
};

export default LocationPicker;