import { SimplePool, getEventHash, getSignature, generatePrivateKey, getPublicKey, nip19 } from 'nostr-tools'

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
    this.userProfile = null
    this.familyLocations = new Map()
    this.familyPhotos = []
  }

  // Generate new Nostr keypair
  generateKeys() {
    const privateKey = generatePrivateKey()
    const publicKey = getPublicKey(privateKey)
    const npub = nip19.npubEncode(publicKey)
    const nsec = nip19.nsecEncode(privateKey)
    
    return { privateKey, publicKey, npub, nsec }
  }

  // Import existing keys from nsec
  importKeys(nsec) {
    try {
      const { type, data } = nip19.decode(nsec)
      if (type !== 'nsec') {
        throw new Error('Invalid nsec format')
      }
      
      const privateKey = data
      const publicKey = getPublicKey(privateKey)
      const npub = nip19.npubEncode(publicKey)
      
      return { privateKey, publicKey, npub, nsec }
    } catch (error) {
      throw new Error('Invalid nsec key: ' + error.message)
    }
  }

  // Set user keys and save to localStorage
  setUserKeys(keys, profile = {}) {
    this.privateKey = keys.privateKey
    this.publicKey = keys.publicKey
    this.userProfile = {
      npub: keys.npub,
      nsec: keys.nsec,
      name: profile.name || 'Anonymous',
      ...profile
    }

    // Save to localStorage
    localStorage.setItem('nostravel_keys', JSON.stringify({
      nsec: keys.nsec,
      profile: this.userProfile
    }))
  }

  // Load existing keys from localStorage
  loadStoredKeys() {
    try {
      const stored = localStorage.getItem('nostravel_keys')
      if (stored) {
        const { nsec, profile } = JSON.parse(stored)
        const keys = this.importKeys(nsec)
        this.setUserKeys(keys, profile)
        return true
      }
    } catch (error) {
      console.error('Failed to load stored keys:', error)
      localStorage.removeItem('nostravel_keys')
    }
    return false
  }

  // Clear stored keys (logout)
  clearKeys() {
    this.privateKey = null
    this.publicKey = null
    this.userProfile = null
    this.familyLocations.clear()
    this.familyPhotos = []
    localStorage.removeItem('nostravel_keys')
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.privateKey && this.publicKey && this.userProfile)
  }

  // Get user info
  getUserInfo() {
    return this.userProfile
  }

  // Get short display name from npub
  getDisplayName(npub) {
    if (!npub) return 'Unknown'
    return npub.slice(0, 12) + '...'
  }

  async connect() {
    try {
      // Try to load existing keys first
      if (!this.isAuthenticated()) {
        this.loadStoredKeys()
      }

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

  async shareLocation(location) {
    if (!this.isAuthenticated()) {
      console.warn('User not authenticated')
      return false
    }

    const content = JSON.stringify({
      type: 'location',
      lat: location.lat,
      lng: location.lng,
      timestamp: location.timestamp || Date.now(),
      name: this.userProfile.name,
      npub: this.userProfile.npub,
      app: 'nostravel-fugen'
    })

    const event = this.createEvent(1, content, [
      ['t', 'nostravel'],
      ['t', 'location'],
      ['t', 'fugen'],
      ['geohash', this.encodeGeohash(location.lat, location.lng, 8)]
    ])

    const success = await this.publishEvent(event)
    
    if (success) {
      // Update local state
      this.familyLocations.set(this.publicKey, {
        name: this.userProfile.name,
        lat: location.lat,
        lng: location.lng,
        timestamp: Date.now(),
        pubkey: this.publicKey,
        npub: this.userProfile.npub
      })
    }
    
    return success
  }

  async sharePhoto(photo) {
    if (!this.isAuthenticated()) {
      console.warn('User not authenticated')
      return false
    }

    const content = JSON.stringify({
      type: 'photo',
      url: photo.url,
      caption: photo.caption,
      location: photo.location,
      timestamp: photo.timestamp || Date.now(),
      author: this.userProfile.name,
      npub: this.userProfile.npub,
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
    const success = await this.publishEvent(event)
    
    if (success) {
      // Update local state
      const newPhoto = {
        id: event.id,
        url: photo.url,
        caption: photo.caption,
        location: photo.location,
        timestamp: Date.now(),
        author: this.userProfile.name,
        pubkey: this.publicKey,
        npub: this.userProfile.npub
      }
      this.familyPhotos.unshift(newPhoto)
    }
    
    return success
  }

  subscribeToLocations(callback) {
    if (!this.connected) {
      // Return current local locations and simulate some demo data when not connected
      setTimeout(() => {
        const demoLocations = [
          {
            name: 'Demo User 1',
            lat: 47.3450,
            lng: 11.8490,
            timestamp: Date.now() - 300000, // 5 minutes ago
            npub: 'npub1demo1...'
          },
          {
            name: 'Demo User 2',
            lat: 47.3440,
            lng: 11.8480,
            timestamp: Date.now() - 600000, // 10 minutes ago
            npub: 'npub1demo2...'
          }
        ]
        
        // Add current user location if authenticated
        if (this.isAuthenticated() && this.familyLocations.has(this.publicKey)) {
          demoLocations.push(this.familyLocations.get(this.publicKey))
        }
        
        callback(demoLocations)
      }, 2000)
      return
    }

    const filter = {
      kinds: [1],
      '#t': ['nostravel', 'location'],
      since: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
    }

    const sub = this.pool.sub(this.relays, [filter])

    sub.on('event', (event) => {
      try {
        const data = JSON.parse(event.content)
        if (data.type === 'location' && data.app === 'nostravel-fugen') {
          this.familyLocations.set(event.pubkey, {
            name: data.name,
            lat: data.lat,
            lng: data.lng,
            timestamp: data.timestamp,
            pubkey: event.pubkey,
            npub: data.npub || nip19.npubEncode(event.pubkey)
          })
          callback(Array.from(this.familyLocations.values()))
        }
      } catch (error) {
        console.error('Error parsing location event:', error)
      }
    })

    this.subscriptions.set('locations', sub)
    
    // Return current locations immediately
    callback(Array.from(this.familyLocations.values()))
  }

  subscribeToPhotos(callback) {
    if (!this.connected) {
      // Return current local photos and simulate some demo data when not connected
      setTimeout(() => {
        const demoPhotos = [
          {
            id: 'demo1',
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+🎿 Demo Photo</3RleHQ+PC9zdmc+',
            caption: 'Amazing powder day!',
            location: { lat: 47.3447, lng: 11.8486 },
            timestamp: Date.now() - 1800000, // 30 minutes ago
            author: 'Demo User',
            npub: 'npub1demo...'
          }
        ]
        
        // Add current user photos
        const allPhotos = [...this.familyPhotos, ...demoPhotos]
        callback(allPhotos.sort((a, b) => b.timestamp - a.timestamp))
      }, 3000)
      return
    }

    const filter = {
      kinds: [1],
      '#t': ['nostravel', 'photo'],
      since: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
    }

    const sub = this.pool.sub(this.relays, [filter])

    sub.on('event', (event) => {
      try {
        const data = JSON.parse(event.content)
        if (data.type === 'photo' && data.app === 'nostravel-fugen') {
          const photo = {
            id: event.id,
            url: data.url,
            caption: data.caption,
            location: data.location,
            timestamp: data.timestamp,
            author: data.author,
            pubkey: event.pubkey,
            npub: data.npub || nip19.npubEncode(event.pubkey)
          }
          
          // Avoid duplicates
          if (!this.familyPhotos.find(p => p.id === photo.id)) {
            this.familyPhotos.unshift(photo)
            this.familyPhotos.sort((a, b) => b.timestamp - a.timestamp)
          }
          
          callback([...this.familyPhotos])
        }
      } catch (error) {
        console.error('Error parsing photo event:', error)
      }
    })

    this.subscriptions.set('photos', sub)
    
    // Return current photos immediately
    callback([...this.familyPhotos])
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