import React, { useState } from 'react'
import { Camera, Upload, MessageSquare } from 'lucide-react'

const PhotoPanel = ({ photos, onPhotoUpload }) => {
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    
    try {
      // Convert file to base64 for demo purposes
      // In a real app, you'd upload to a proper image hosting service
      const reader = new FileReader()
      reader.onload = (e) => {
        const photo = {
          url: e.target.result,
          caption: caption || 'Shared from Fügen!'
        }
        
        onPhotoUpload(photo)
        setCaption('')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading photo:', error)
      setUploading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Photos & Notes</h3>
      
      {/* Photo Upload */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Add a caption or note..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <label className="photo-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <Camera size={32} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            {uploading ? 'Uploading...' : 'Click to upload photo'}
          </div>
        </label>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          <Upload size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No photos shared yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Upload your first photo from the slopes!
          </p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div key={index} className="photo-item">
              <img src={photo.url} alt={photo.caption} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                color: 'white',
                padding: '1rem 0.5rem 0.5rem',
                fontSize: '0.75rem'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {photo.caption}
                </div>
                <div style={{ opacity: 0.8 }}>
                  {photo.author} • {formatTime(photo.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Notes */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={16} />
          Quick Notes
        </h4>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            '🎿 Great powder today!',
            '☀️ Perfect weather',
            '🍕 Lunch break',
            '🚡 Taking the gondola',
            '📍 Meet at base station',
            '❄️ Fresh snow!'
          ].map((note, index) => (
            <button
              key={index}
              onClick={() => {
                onPhotoUpload({
                  url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+📝</3RleHQ+PC9zdmc+',
                  caption: note
                })
              }}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '20px',
                background: 'white',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#667eea'
                e.target.style.color = 'white'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white'
                e.target.style.color = 'inherit'
              }}
            >
              {note}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PhotoPanel