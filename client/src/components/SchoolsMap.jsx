import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A distinct icon for "your location" vs school markers
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33],
  className: 'user-location-marker',
});

// props: schools = [{id, name, latitude, longitude, city, distanceKm}], userLocation = [lat, lng] | null
const SchoolsMap = ({ schools, userLocation }) => {
  const validSchools = schools.filter((s) => s.latitude != null && s.longitude != null);
  const center = userLocation || (validSchools[0] ? [validSchools[0].latitude, validSchools[0].longitude] : [20.5937, 78.9629]);

  return (
    <div className="leaflet-map-container" style={{ height: '360px', marginBottom: '24px' }}>
      <MapContainer center={center} zoom={userLocation ? 12 : 5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}
        {validSchools.map((s) => (
          <Marker key={s.id} position={[s.latitude, s.longitude]}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.city}
              {s.distanceKm !== undefined && <><br />{s.distanceKm} km away</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SchoolsMap;