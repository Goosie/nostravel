import React from 'react'
import { MapPin, Clock } from 'lucide-react'

const LocationPanel = ({ locations, userLocation }) => {
  const formatTime = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return null
    
    const R = 6371 // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    if (distance < 1) return `${Math.round(distance * 1000)}m`
    return `${distance.toFixed(1)}km`
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Family Locations</h3>
      
      {userLocation && (
        <div className="location-item" style={{ background: '#e3f2fd', borderRadius: '8px', marginBottom: '1rem' }}>
          <div className="status-indicator" style={{ background: '#2196f3' }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#1976d2' }}>You</div>
            <div style={{ fontSize: '0.875rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} />
              {formatTime(userLocation.timestamp)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#999' }}>
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      {locations.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No family members sharing location yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Ask them to open the app and share their location!
          </p>
        </div>
      ) : (
        locations.map((location, index) => (
          <div key={index} className="location-item">
            <div className="status-indicator"></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600' }}>{location.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} />
                {formatTime(location.timestamp)}
              </div>
              {userLocation && (
                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                  {getDistance(userLocation, location)} away
                </div>
              )}
            </div>
          </div>
        ))
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Location Sharing</h4>
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.4' }}>
          Your location is automatically shared every 30 seconds when the app is open. 
          Family members using this app will see your location on the map.
        </p>
      </div>
    </div>
  )
}

export default LocationPanel