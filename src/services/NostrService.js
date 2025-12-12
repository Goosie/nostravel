import { SimplePool, getEventHash, getSignature, generatePrivateKey, getPublicKey } from 'nostr-tools'

class NostrService {
  constructor() {
    this.pool = new SimplePool()
    this.relays = [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.nostr.band',
      'wss://nostr-pub.wellorder.net'
    ]
    this.privateKey = null
    this.publicKey = null
    this.connected = false
    this.subscriptions = new Map()
  }

  async connect() {
    try {
      // Generate or retrieve private key (in a real app, this should be stored securely)
      this.privateKey = localStorage.getItem('nostr-private-key') || generatePrivateKey()
      localStorage.setItem('nostr-private-key', this.privateKey)
      
      this.publicKey = getPublicKey(this.privateKey)
      
      // Connect to relays
      await Promise.all(
        this.relays.map(relay => 
          this.pool.ensureRelay(relay).catch(err => 
            console.warn(`Failed to connect to ${relay}:`, err)
          )
        )
      )
      
      this.connected = true
      console.log('Connected to Nostr relays')
      return true
    } catch (error) {
      console.error('Failed to connect to Nostr:', error)
      // Fallback to local mode
      this.connected = false
      return false
    }
  }

  disconnect() {
    this.pool.close(this.relays)
    this.subscriptions.clear()
    this.connected = false
  }

  createEvent(kind, content, tags = []) {
    const event = {
      kind,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content,
      pubkey: this.publicKey,
    }
    
    event.id = getEventHash(event)
    event.sig = getSignature(event, this.privateKey)
    
    return event
  }

  async publishEvent(event) {
    if (!this.connected) {
      console.warn('Not connected to Nostr, storing locally')
      return false
    }

    try {
      await Promise.all(
        this.pool.publish(this.relays, event)
      )
      return true
    } catch (error) {
      console.error('Failed to publish event:', error)
      return false
    }
  }

  async shareLocation(location, userName) {
    const content = JSON.stringify({
      type: 'location',
      lat: location.lat,
      lng: location.lng,
      timestamp: location.timestamp,
      name: userName,
      app: 'nostravel-fugen'
    })

    const event = this.createEvent(1, content, [
      ['t', 'nostravel'],
      ['t', 'location'],
      ['t', 'fugen'],
      ['geohash', this.encodeGeohash(location.lat, location.lng, 8)]
    ])

    return await this.publishEvent(event)
  }

  async sharePhoto(photo) {
    const content = JSON.stringify({
      type: 'photo',
      url: photo.url,
      caption: photo.caption,
      location: photo.location,
      timestamp: photo.timestamp,
      author: photo.author,
      app: 'nostravel-fugen'
    })

    const tags = [
      ['t', 'nostravel'],
      ['t', 'photo'],
      ['t', 'fugen']
    ]

    if (photo.location) {
      tags.push(['geohash', this.encodeGeohash(photo.location.lat, photo.location.lng, 8)])
    }

    const event = this.createEvent(1, content, tags)
    return await this.publishEvent(event)
  }

  subscribeToLocations(callback) {
    if (!this.connected) {
      // Simulate some demo data when not connected
      setTimeout(() => {
        callback([
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
      }, 2000)
      return
    }

    const filter = {
      kinds: [1],
      '#t': ['nostravel', 'location'],
      since: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
    }

    const sub = this.pool.sub(this.relays, [filter])
    const locations = new Map()

    sub.on('event', (event) => {
      try {
        const data = JSON.parse(event.content)
        if (data.type === 'location' && data.app === 'nostravel-fugen') {
          locations.set(event.pubkey, data)
          callback(Array.from(locations.values()).filter(loc => loc.name))
        }
      } catch (error) {
        console.error('Error parsing location event:', error)
      }
    })

    this.subscriptions.set('locations', sub)
  }

  subscribeToPhotos(callback) {
    if (!this.connected) {
      // Simulate some demo data when not connected
      setTimeout(() => {
        callback([
          {
            id: 1,
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+🎿 Demo Photo</3RleHQ+PC9zdmc+',
            caption: 'Amazing powder day!',
            location: { lat: 47.3447, lng: 11.8486 },
            timestamp: Date.now() - 1800000, // 30 minutes ago
            author: 'Demo User'
          }
        ])
      }, 3000)
      return
    }

    const filter = {
      kinds: [1],
      '#t': ['nostravel', 'photo'],
      since: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
    }

    const sub = this.pool.sub(this.relays, [filter])
    const photos = []

    sub.on('event', (event) => {
      try {
        const data = JSON.parse(event.content)
        if (data.type === 'photo' && data.app === 'nostravel-fugen') {
          photos.push({
            id: event.id,
            ...data
          })
          callback([...photos].sort((a, b) => b.timestamp - a.timestamp))
        }
      } catch (error) {
        console.error('Error parsing photo event:', error)
      }
    })

    this.subscriptions.set('photos', sub)
  }

  // Simple geohash encoding for location indexing
  encodeGeohash(lat, lng, precision = 8) {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz'
    let latRange = [-90, 90]
    let lngRange = [-180, 180]
    let geohash = ''
    let bits = 0
    let bit = 0
    let even = true

    while (geohash.length < precision) {
      if (even) {
        const mid = (lngRange[0] + lngRange[1]) / 2
        if (lng >= mid) {
          bit = (bit << 1) | 1
          lngRange[0] = mid
        } else {
          bit = bit << 1
          lngRange[1] = mid
        }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2
        if (lat >= mid) {
          bit = (bit << 1) | 1
          latRange[0] = mid
        } else {
          bit = bit << 1
          latRange[1] = mid
        }
      }

      even = !even
      bits++

      if (bits === 5) {
        geohash += base32[bit]
        bits = 0
        bit = 0
      }
    }

    return geohash
  }
}

export default new NostrService()