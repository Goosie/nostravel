import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const familyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const photoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const gondolaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const MapComponent = ({ familyLocations, userLocation, photos }) => {
  // Fügen ski area coordinates
  const fugenCenter = [47.3447, 11.8486]
  
  // Gondola and lift locations in Fügen area
  const gondolas = [
    { name: 'Spieljochbahn', lat: 47.3447, lng: 11.8486, type: 'Gondola' },
    { name: 'Hochzillertal-Kaltenbach', lat: 47.2833, lng: 11.8667, type: 'Gondola' },
    { name: 'Hochfügen Ski Area', lat: 47.3167, lng: 11.8833, type: 'Ski Area' },
    { name: 'Zillertal Arena', lat: 47.2500, lng: 11.9000, type: 'Ski Area' }
  ]

  // Ski slopes/pistes (simplified representation)
  const skiSlopes = [
    // Spieljoch area slopes
    [[47.3447, 11.8486], [47.3500, 11.8550], [47.3550, 11.8600]],
    [[47.3447, 11.8486], [47.3400, 11.8520], [47.3350, 11.8580]],
    // Hochfügen area slopes
    [[47.3167, 11.8833], [47.3200, 11.8900], [47.3250, 11.8950]],
    [[47.3167, 11.8833], [47.3100, 11.8870], [47.3050, 11.8920]]
  ]

  return (
    <MapContainer
      center={userLocation ? [userLocation.lat, userLocation.lng] : fugenCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Ski slopes */}
      {skiSlopes.map((slope, index) => (
        <Polyline
          key={`slope-${index}`}
          positions={slope}
          color="#0066cc"
          weight={3}
          opacity={0.7}
        />
      ))}

      {/* Gondolas and lifts */}
      {gondolas.map((gondola, index) => (
        <Marker
          key={`gondola-${index}`}
          position={[gondola.lat, gondola.lng]}
          icon={gondolaIcon}
        >
          <Popup>
            <div>
              <h3>{gondola.name}</h3>
              <p>Type: {gondola.type}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* User location */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>
            <div>
              <h3>Your Location</h3>
              <p>Last updated: {new Date(userLocation.timestamp).toLocaleTimeString()}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Family locations */}
      {familyLocations.map((location, index) => (
        <Marker
          key={`family-${index}`}
          position={[location.lat, location.lng]}
          icon={familyIcon}
        >
          <Popup>
            <div>
              <h3>{location.name}</h3>
              <p>Last seen: {new Date(location.timestamp).toLocaleTimeString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Photo locations */}
      {photos.map((photo, index) => (
        photo.location && (
          <Marker
            key={`photo-${index}`}
            position={[photo.location.lat, photo.location.lng]}
            icon={photoIcon}
          >
            <Popup>
              <div style={{ maxWidth: '200px' }}>
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <h4 style={{ margin: '0.5rem 0' }}>{photo.caption}</h4>
                <p style={{ fontSize: '0.875rem', color: '#666' }}>
                  By {photo.author} - {new Date(photo.timestamp).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}

export default MapComponent