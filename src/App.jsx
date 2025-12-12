import React, { useState, useEffect } from 'react'
import { MapPin, Camera, MessageSquare, Utensils, Wifi, WifiOff, LogOut, User } from 'lucide-react'
import MapComponent from './components/MapComponent'
import LocationPanel from './components/LocationPanel'
import PhotoPanel from './components/PhotoPanel'
import RestaurantPanel from './components/RestaurantPanel'
import NostrOnboarding from './components/NostrOnboarding'
import NostrService from './services/NostrService'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('locations')
  const [familyLocations, setFamilyLocations] = useState([])
  const [photos, setPhotos] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [nostrConnected, setNostrConnected] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Connect to Nostr
        const connected = await NostrService.connect()
        setNostrConnected(connected)
        
        // Check if user is already authenticated
        const userInfo = NostrService.getUserInfo()
        if (userInfo) {
          setUserProfile(userInfo)
        } else {
          // Show onboarding for new users
          setShowOnboarding(true)
        }
        
        // Subscribe to location updates
        NostrService.subscribeToLocations((locations) => {
          setFamilyLocations(locations)
        })
        
        // Subscribe to photos
        NostrService.subscribeToPhotos((photos) => {
          setPhotos(photos)
        })
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setNostrConnected(false)
      }
    }

    initializeApp()

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
          
          // Share location if authenticated
          if (NostrService.isAuthenticated()) {
            NostrService.shareLocation(location)
          }
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

    // Update location every 30 seconds if authenticated
    const locationInterval = setInterval(() => {
      if (navigator.geolocation && NostrService.isAuthenticated()) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: Date.now()
            }
            setUserLocation(location)
            NostrService.shareLocation(location)
          }
        )
      }
    }, 30000)

    return () => {
      clearInterval(locationInterval)
      NostrService.disconnect()
    }
  }, [])

  const handlePhotoUpload = async (photo) => {
    if (!NostrService.isAuthenticated()) {
      alert('Please set up your Nostr identity first')
      return
    }

    const photoData = {
      ...photo,
      timestamp: Date.now(),
      location: userLocation || { lat: 47.3447, lng: 11.8486 }
    }
    
    const success = await NostrService.sharePhoto(photoData)
    if (!success) {
      console.error('Failed to share photo')
    }
  }

  const handleOnboardingComplete = (keys, profile) => {
    NostrService.setUserKeys(keys, profile)
    setUserProfile(NostrService.getUserInfo())
    setShowOnboarding(false)
    
    // Share current location after authentication
    if (userLocation) {
      NostrService.shareLocation(userLocation)
    }
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    // Continue in demo mode without authentication
  }

  const handleLogout = () => {
    NostrService.clearKeys()
    setUserProfile(null)
    setFamilyLocations([])
    setPhotos([])
    setShowOnboarding(true)
  }

  const tabs = [
    { id: 'locations', label: 'Family Locations', icon: MapPin },
    { id: 'photos', label: 'Photos & Notes', icon: Camera },
    { id: 'restaurants', label: 'Restaurants & Bars', icon: Utensils }
  ]

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🎿 Nostravel - Fügen Winter Sports</h1>
          
          <div className="header-right">
            <div className="connection-status">
              {nostrConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{nostrConnected ? 'Connected to Nostr' : 'Connecting...'}</span>
            </div>
            
            {userProfile ? (
              <div className="user-info">
                <div className="user-details">
                  <User size={16} />
                  <span>{userProfile.name}</span>
                  <span className="npub">{userProfile.npub.slice(0, 12)}...</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowOnboarding(true)}
                className="login-btn"
              >
                <User size={16} />
                Setup Nostr Identity
              </button>
            )}
          </div>
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

      {showOnboarding && (
        <NostrOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  )
}

export default App