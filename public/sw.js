// Called when any request is made from the page
self.addEventListener('fetch', (event) => {
    event.respondWith(async function() {
      // Open the cache
      let cache = await caches.open('diaryCache')
      // Try and get from the server
      try {
        let response = await fetch(event.request)
        // Add to cache
        cache.put(event.request, response.clone())

        return response
      } 
  
      // If it can't be loaded from the server, load from cache
      catch (err) {  
        // Tell the client that it's offline
        informOffline(event.clientId)

        return cache.match(event.request)
      }
    }());
  });
  
  // Informs a client that it is offline
  let informOffline = async function(id) {
    // Get the client
    let client = await clients.get(id)
    client.postMessage(null)
  }