// Service Worker for offline functionality and caching
const CACHE_NAME = 'recipe-website-v1'
const STATIC_CACHE_NAME = 'recipe-website-static-v1'
const DYNAMIC_CACHE_NAME = 'recipe-website-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/images/og-default.jpg'
]

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/recipes',
  '/api/blog',
  '/api/categories',
  '/api/tags'
]

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Service Worker: Install failed', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
      .catch(error => {
        console.error('Service Worker: Activation failed', error)
      })
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request))
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request))
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request))
  } else {
    event.respondWith(handleGenericRequest(request))
  }
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'recipe-save') {
    event.waitUntil(syncRecipeSaves())
  } else if (event.tag === 'comment-submit') {
    event.waitUntil(syncCommentSubmissions())
  } else if (event.tag === 'rating-submit') {
    event.waitUntil(syncRatingSubmissions())
  }
})

// Push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received', event)
  
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/images/icons/icon-192x192.png',
      badge: '/images/icons/icon-192x192.png',
      image: data.image,
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View Recipe',
          icon: '/images/icons/view-icon.png'
        },
        {
          action: 'save',
          title: 'Save Recipe',
          icon: '/images/icons/save-icon.png'
        }
      ],
      tag: data.tag || 'recipe-notification',
      renotify: true,
      silent: false
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  } else if (event.action === 'save') {
    event.waitUntil(
      handleSaveRecipe(event.notification.data.recipeId)
    )
  } else {
    // Default click behavior
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data.type === 'CACHE_RECIPE') {
    cacheRecipe(event.data.recipe)
  } else if (event.data.type === 'CLEAR_CACHE') {
    clearCache(event.data.cacheType)
  }
})

// Helper functions
function isStaticAsset(request) {
  return request.url.includes('/_next/static/') ||
         request.url.includes('/static/') ||
         request.url.includes('.css') ||
         request.url.includes('.js') ||
         request.url.includes('.woff') ||
         request.url.includes('.woff2')
}

function isApiRequest(request) {
  return request.url.includes('/api/')
}

function isImageRequest(request) {
  return request.url.includes('/images/') ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.png') ||
         request.url.includes('.webp') ||
         request.url.includes('.svg')
}

function isPageRequest(request) {
  return request.headers.get('Accept').includes('text/html')
}

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Service Worker: Static asset fetch failed', error)
    return new Response('Asset not available', { status: 404 })
  }
}

// Network-first strategy for API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Service Worker: API network failed, trying cache')
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Stale-while-revalidate for images
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request)
  
  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE_NAME)
        cache.then(c => c.put(request, response.clone()))
      }
      return response
    })
    .catch(() => null)

  return cachedResponse || networkPromise
}

// Network-first with offline fallback for pages
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Page network failed, trying cache')
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return caches.match('/offline.html')
  }
}

// Generic request handling
async function handleGenericRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Content not available', { status: 404 })
  }
}

// Background sync functions
async function syncRecipeSaves() {
  try {
    const savedRecipes = await getStoredData('pendingRecipeSaves')
    for (const recipe of savedRecipes) {
      await fetch('/api/recipes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      })
    }
    await clearStoredData('pendingRecipeSaves')
  } catch (error) {
    console.error('Service Worker: Recipe save sync failed', error)
  }
}

async function syncCommentSubmissions() {
  try {
    const comments = await getStoredData('pendingComments')
    for (const comment of comments) {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      })
    }
    await clearStoredData('pendingComments')
  } catch (error) {
    console.error('Service Worker: Comment sync failed', error)
  }
}

async function syncRatingSubmissions() {
  try {
    const ratings = await getStoredData('pendingRatings')
    for (const rating of ratings) {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating)
      })
    }
    await clearStoredData('pendingRatings')
  } catch (error) {
    console.error('Service Worker: Rating sync failed', error)
  }
}

// Storage utilities
async function getStoredData(key) {
  try {
    const data = await caches.open('storage')
    const response = await data.match(key)
    return response ? await response.json() : []
  } catch (error) {
    return []
  }
}

async function clearStoredData(key) {
  try {
    const data = await caches.open('storage')
    await data.delete(key)
  } catch (error) {
    console.error('Service Worker: Clear storage failed', error)
  }
}

// Cache management
async function cacheRecipe(recipe) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const response = new Response(JSON.stringify(recipe))
    await cache.put(`/api/recipes/${recipe.slug}`, response)
  } catch (error) {
    console.error('Service Worker: Cache recipe failed', error)
  }
}

async function clearCache(cacheType) {
  try {
    if (cacheType === 'all') {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    } else {
      await caches.delete(cacheType)
    }
  } catch (error) {
    console.error('Service Worker: Clear cache failed', error)
  }
}

// Save recipe for offline access
async function handleSaveRecipe(recipeId) {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`)
    if (response.ok) {
      const recipe = await response.json()
      await cacheRecipe(recipe)
      
      // Show success notification
      self.registration.showNotification('Recipe Saved!', {
        body: 'Recipe saved for offline access',
        icon: '/images/icons/icon-192x192.png'
      })
    }
  } catch (error) {
    console.error('Service Worker: Save recipe failed', error)
  }
}

// Performance monitoring
function measurePerformance(name, fn) {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  
  console.log(`Service Worker: ${name} took ${duration}ms`)
  return result
}

// Cleanup old caches periodically
setInterval(async () => {
  try {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter(name => 
      name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME
    )
    
    await Promise.all(oldCaches.map(name => caches.delete(name)))
  } catch (error) {
    console.error('Service Worker: Cache cleanup failed', error)
  }
}, 24 * 60 * 60 * 1000) // Run daily

console.log('Service Worker: Loaded')