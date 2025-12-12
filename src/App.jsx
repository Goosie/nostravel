import React, { useState, useEffect } from 'react'
import { MapPin, Camera, MessageSquare, Utensils, Wifi, WifiOff } from 'lucide-react'
import MapComponent from './components/MapComponent'
import LocationPanel from './components/LocationPanel'
import PhotoPanel from './components/PhotoPanel'
import RestaurantPanel from './components/RestaurantPanel'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('locations')
  const [familyLocations, setFamilyLocations] = useState([])
  const [photos, setPhotos] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [nostrConnected, setNostrConnected] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Simulate Nostr connection for demo
    setTimeout(() => {
      setNostrConnected(true)
      
      // Add demo family locations
      setFamilyLocations([
        {
          name: 'Mom',
          lat: 47.3450,
          lng: 11.8490,
          timestamp: Date.now() - 300000 // 5 minutes ago
        },
        {
          name: 'Dad',
          lat: 47.3440,
          lng: 11.8480,
          timestamp: Date.now() - 600000 // 10 minutes ago
        }
      ])
      
      // Add demo photos
      setPhotos([
        {
          id: 1,
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+🎿 Demo Photo</3RleHQ+PC9zdmc+',
          caption: 'Amazing powder day!',
          location: { lat: 47.3447, lng: 11.8486 },
          timestamp: Date.now() - 1800000, // 30 minutes ago
          author: 'Demo User'
        }
      ])
    }, 1000)

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now()
          }
          setUserLocation(location)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Default to Fügen coordinates if geolocation fails
          const fugenLocation = { lat: 47.3447, lng: 11.8486, timestamp: Date.now() }
          setUserLocation(fugenLocation)
        }
      )
    } else {
      // Default to Fügen coordinates if geolocation not available
      const fugenLocation = { lat: 47.3447, lng: 11.8486, timestamp: Date.now() }
      setUserLocation(fugenLocation)
    }
  }, [])

  const handlePhotoUpload = (photo) => {
    const newPhoto = {
      id: Date.now(),
      url: photo.url,
      caption: photo.caption,
      location: userLocation,
      timestamp: Date.now(),
      author: userName || 'Anonymous'
    }
    
    setPhotos(prev => [...prev, newPhoto])
  }

  const tabs = [
    { id: 'locations', label: 'Family Locations', icon: MapPin },
    { id: 'photos', label: 'Photos & Notes', icon: Camera },
    { id: 'restaurants', label: 'Restaurants & Bars', icon: Utensils }
  ]

  return (
    <div className="app">
      <header className="header">
        <h1>🎿 Nostravel - Fügen Winter Sports</h1>
        <div className="connection-status">
          {nostrConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{nostrConnected ? 'Connected to Nostr' : 'Connecting...'}</span>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              width: '200px'
            }}
          />
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar">
          <div className="tab-buttons">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="tab-content">
            {activeTab === 'locations' && (
              <LocationPanel 
                locations={familyLocations} 
                userLocation={userLocation}
              />
            )}
            {activeTab === 'photos' && (
              <PhotoPanel 
                photos={photos} 
                onPhotoUpload={handlePhotoUpload}
              />
            )}
            {activeTab === 'restaurants' && (
              <RestaurantPanel />
            )}
          </div>
        </div>

        <div className="map-container">
          <MapComponent 
            familyLocations={familyLocations}
            userLocation={userLocation}
            photos={photos}
          />
        </div>
      </div>
    </div>
  )
}

export default App