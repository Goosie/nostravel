import React, { useState } from 'react'
import { Star, MapPin, Clock, Phone } from 'lucide-react'

const RestaurantPanel = () => {
  const [filter, setFilter] = useState('all')

  // Restaurant and bar data for Fügen area
  const establishments = [
    {
      name: 'Restaurant Kohlerhof',
      type: 'Austrian Restaurant',
      category: 'restaurant',
      rating: 4.5,
      description: 'Traditional Austrian cuisine with mountain views',
      location: 'Fügen center',
      hours: '11:00 - 22:00',
      specialties: ['Schnitzel', 'Kaiserschmarrn', 'Local beer']
    },
    {
      name: 'Pizz Pub',
      type: 'Après-Ski Bar',
      category: 'bar',
      rating: 4.3,
      description: 'Trendy après-ski location right by Spieljochbahn',
      location: 'Near Spieljochbahn',
      hours: '15:00 - 02:00',
      specialties: ['Cocktails', 'Live music', 'Party atmosphere']
    },
    {
      name: 'Cafe Restaurant Edhof',
      type: 'Family Restaurant',
      category: 'restaurant',
      rating: 4.4,
      description: 'Family-friendly restaurant with local specialties',
      location: 'Fügen village',
      hours: '08:00 - 21:00',
      specialties: ['Breakfast', 'Traditional dishes', 'Kids menu']
    },
    {
      name: 'Postalm Après Ski Bar',
      type: 'Mountain Hut',
      category: 'bar',
      rating: 4.2,
      description: 'Mountain hut with panoramic views and drinks',
      location: 'On the slopes',
      hours: '10:00 - 17:00',
      specialties: ['Glühwein', 'Mountain views', 'Ski-in access']
    },
    {
      name: 'Gogola Alm',
      type: 'Mountain Restaurant',
      category: 'restaurant',
      rating: 4.6,
      description: 'High-altitude dining with spectacular views',
      location: 'Hochfügen ski area',
      hours: '09:00 - 16:00',
      specialties: ['Alpine cuisine', 'Panoramic terrace', 'Fresh air']
    },
    {
      name: 'KOSIS Fun Food Bar',
      type: 'Casual Dining',
      category: 'restaurant',
      rating: 4.1,
      description: 'Modern casual dining with international menu',
      location: 'Fügen center',
      hours: '12:00 - 23:00',
      specialties: ['Burgers', 'International food', 'Casual atmosphere']
    },
    {
      name: 'Grillalm Strass',
      type: 'Grill Restaurant',
      category: 'restaurant',
      rating: 4.3,
      description: 'Specializing in grilled meats and hearty portions',
      location: 'Strass im Zillertal',
      hours: '17:00 - 22:00',
      specialties: ['Grilled meats', 'Large portions', 'Local atmosphere']
    },
    {
      name: 'Cafe Bar Lounge Orange',
      type: 'Lounge Bar',
      category: 'bar',
      rating: 4.0,
      description: 'Stylish lounge with cocktails and light bites',
      location: 'Fügen center',
      hours: '18:00 - 01:00',
      specialties: ['Cocktails', 'Lounge atmosphere', 'Late night']
    }
  ]

  const filteredEstablishments = establishments.filter(place => 
    filter === 'all' || place.category === filter
  )

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} fill="#ffc107" color="#ffc107" />)
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} fill="#ffc107" color="#ffc107" style={{ opacity: 0.5 }} />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} color="#e0e0e0" />)
    }

    return stars
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Restaurants & Bars</h3>
      
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'restaurant', label: 'Restaurants' },
          { id: 'bar', label: 'Bars & Après-Ski' }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #dee2e6',
              borderRadius: '20px',
              background: filter === filterOption.id ? '#667eea' : 'white',
              color: filter === filterOption.id ? 'white' : '#333',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Establishments list */}
      <div>
        {filteredEstablishments.map((place, index) => (
          <div key={index} className="restaurant-item">
            <div className="restaurant-name">{place.name}</div>
            <div className="restaurant-type">{place.type}</div>
            
            <div className="restaurant-rating" style={{ marginBottom: '0.5rem' }}>
              {renderStars(place.rating)}
              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                {place.rating}
              </span>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              {place.description}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#999' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={12} />
                {place.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} />
                {place.hours}
              </div>
            </div>
            
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#333', marginBottom: '0.25rem' }}>
                Specialties:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {place.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: '#666'
                    }}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips section */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>💡 Local Tips</h4>
        <ul style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.4', paddingLeft: '1rem' }}>
          <li>Most mountain restaurants close around 16:00-17:00</li>
          <li>Après-ski starts around 15:00 when slopes close</li>
          <li>Book dinner reservations in advance during peak season</li>
          <li>Try the local Zillertal beer and Kaiserschmarrn!</li>
        </ul>
      </div>
    </div>
  )
}

export default RestaurantPanel