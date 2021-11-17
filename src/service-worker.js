// ********************************
// ***** Begin service worker *****
// ********************************

"use strict";

// hodgepodge of google and MDN code

const CACHE_NAME = "Wiki";
const CACHE_ENTRIES = SERVICE_WORKER_MANIFEST_ENTRIES;

// allow these domains to be cached
const CORS_CACHE_LIST = [
	"https://fonts.googleapis.com",
	"https://fonts.gstatic.com",
	"https://cdnjs.cloudflare.com"
]

const DEBUG = false;

function printIfDebug(message) {
	if (DEBUG) console.log(message);
}

function checkStartsWithMultiple(list, target) {
	for (
		let i = 0, len = list.length;
		i < len;
		i++
	){
		if (target.startsWith(list[i]))
			return true;
	}
	return false;
}

// add index page alias
CACHE_ENTRIES.push(
	{ url: "/", revision: null }
);
				
self.addEventListener("install", function (e) {
  printIfDebug("SW install fired, pre-caching assets");
  e.waitUntil(
    // setup cache
    caches.open(CACHE_NAME).then(
		function (cache){
			// cache URLs one by one
			for (
				let i = 0, target, url;
				target = CACHE_ENTRIES[i];
				i++
			) {
			  if (!target instanceof Object) break;
			  url = target["url"];
			  
			  // do cache
			  cache.add(url).then(()=>{
				printIfDebug("Cache " + url + " OK!");
			  }).catch((e)=>{
				console.error("Cache " + url + " failed!");
			  });
			}
			
			// run SW immediately
			self.skipWaiting();
		}
	)
  );
});

self.addEventListener("activate", function(e){
	printIfDebug("SW activate fired, check and cleanup here");
	caches.keys().then(
		async function(keys) {
			// Go through every cache
			for (
				let i = 0, potential_old_cache;
				potential_old_cache = keys[i];
				i++
			) {
				// if we find other caches (maybe from an old version)
				// then destroy them
				if (potential_old_cache !== CACHE_NAME) {
					printIfDebug("Deleting cache: [" + potential_old_cache + "]");
					await caches.delete(potential_old_cache);
				}
				
				printIfDebug("Setting myself as the main SW controller...");
				await self.clients.claim()
			}
		}
	)
});

self.addEventListener("fetch", function(e){
// this will intercept network accesses
	function handleFailedFetch(error, originator){
		console.error(error.message + ": " + originator)
	}
	
	// don't handle non-GET
	if (e.request.method != "GET") return;
	
	// don't handle cross origin requests except for google fonts and FA
	if (!(
		e.request.url.startsWith(self.location.origin) ||
		checkStartsWithMultiple(CORS_CACHE_LIST, e.request.url)
		)
	) return;
	
	e.respondWith(
		caches.open(CACHE_NAME).then(async function(cache){
			// check if we have our URL in the cache
			const do_you_has = await cache.match(e.request);
				
			// we have cache, but try updating it in the background
			if (do_you_has) {
				printIfDebug("Using cached request for " + e.request.url);
				e.waitUntil(cache.add(e.request.url).catch((err)=>{ handleFailedFetch(err, e.request.url); }));
				return do_you_has;
			}
			
			// use a live copy and cache it if available
			printIfDebug("Attempting live copy of " + e.request.url);
			return cache.add(e.request.url).catch((err)=>{ handleFailedFetch(err, e.request.url); }), fetch(e.request).catch((err)=>{ handleFailedFetch(err, e.request.url); });
		})
	);
});

// ********************************
// ***** End service worker *******
// ********************************