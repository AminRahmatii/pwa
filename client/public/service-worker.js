importScripts('/static/js/dexie.js');
importScripts('/static/js/db.js');

let CACHE_VERSION = 1.04;

let CURRENT_CACHE = {
    static : 'static-cache-v' + CACHE_VERSION,
    dynamic : 'dynamic-cache-v' + CACHE_VERSION
};

self.addEventListener('install' , (event) => {
    console.log('installing service worker' , event);
    event.waitUntil(
        caches.open(CURRENT_CACHE['static'])
            .then((cache) => {
                cache.addAll([
                    '/',
                    '/offline.html',
                    '/static/css/materialize.min.css',
                    '/static/js/dexie.js',
                    '/static/js/db.js',
                    '/static/js/app.js',
                    '/static/js/materialize.min.js',
                    '/static/css/vazir.css',
                    '/static/css/style.css'
                ]);
            })
    )
})


self.addEventListener('activate' , (event) => {
    console.log('activating service worker' , event);
    let expectedCacheNames = Object.values(CURRENT_CACHE);

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.forEach(cacheName => {
                    if(! expectedCacheNames.includes(cacheName)) {
                        console.log('Deleting out of date cache:' , cacheName);

                        return caches.delete(cacheName);
                    }
                })
            )
        })
    )

});

// self.addEventListener('fetch' , (event) => {
//     event.respondWith(
//         caches.open(CURRENT_CACHE['static']).then((cache) => {
//             return cache.match(event.request).then(response => {
//                 if(response) {
//                     console.log('Found response in cache:' , response);

//                     return response;
//                 }  

//                 console.log('Fetching request from the network');

//                 return fetch(event.request).then(networkResponse => {
//                     cache.put(event.request , networkResponse.clone());

//                     return networkResponse;
//                 }).catch(err => {
//                     console.log('error in fetch handler:' , err);
//                     throw err;
//                 })
//             })
//         })
//     )
// });

// self.addEventListener('fetch' , (event) => {
//     let urls = [
//         'http://roocket.org/api/products'
//     ]

//     if(urls.indexOf(event.request.url) > -1) {
//         return event.respondWith(

//             fetch(event.request)
//                 .then(response => {
                    
//                     let cloneRes = response.clone();
//                     cloneRes.json()
//                         .then(res => {
//                             let products = res.data.data;
//                             products.forEach(product => {
//                                 db.products.put(product);
//                             })
//                         })
                    
//                     return response;
//                 })

//         )
//     } else {
//         console.log('cache first')

//        return event.respondWith(
//             caches.match(event.request).then(response => {
//                 if(response) return response;

//                 return fetch(event.request)
//                             .then(networkResponse => {
//                                 return caches.open(CURRENT_CACHE['dynamic'])
//                                     .then(cache => {
//                                         cache.put(event.request , networkResponse.clone());
//                                         return networkResponse;
//                                     })
//                             })
//                             .catch(err => {
//                                 return caches.open(CURRENT_CACHE['static'])
//                                                 .then(cache =>{ 
//                                                     return cache.match('/offline.html');
//                                                 })
//                             })
//             })
//        )
//     }

    
// });



self.addEventListener('sync' , function(event) {
    console.log('background syncing:' , event);
    if(event.tag == 'sync-new-product') {
        event.waitUntil(
            db.syncProducts.toArray()
                .then(syncProducts => {
                    syncProducts.forEach(product => {
                        let fd = new FormData();
                        fd.append('title' , product.title);
                        fd.append('body' , product.body);
                        fd.append('image' , product.image , Date.now() + '.png');
                        fd.append('price' , product.price);

                        fetch('http://roocket.org/api/products/store?api_token=WvPW4oiRu8zub9HIWLMzTUDo86Ej5twfGt3DhsofPVBK50p4YTVTBZj2JAxa' , {
                            method : 'POST',
                            body : fd 
                        })
                        .then(res => res.json())
                        .then(res => {
                            console.log('response on the sync' , res)
                            if(res.status == 'success') {
                                db.syncProducts
                                    .where({ title : product.title })
                                    .delete()
                                    .then(() => {
                                        console.log('delete item from syncProducts' , product)
                                    });
                            }
                        })
                        .catch(err => {
                            console.log('err from service worker sync proccess' , err)
                        })

                    })
                })
        )
    }
})

self.addEventListener('notificationclick' , (event) => {
    let notification = event.notification;
    let action = event.action;
    let data = notification.data;

    notification.close();

    switch (event.action) {
        case 'download-action':
            promiseCahin = clients.openWindow(data.url)
            break;
        case 'show-action':
            promiseCahin = clients.openWindow(data.url)
            break;
        default:
            promiseCahin = clients.openWindow(data.url)
            break;
    }

    event.waitUntil(promiseCahin);
})

self.addEventListener('push' , (event) => {
    const DEFAULT_TAG = 'simple-notification';

    let data = event.data.json();

    let title = data.notification.title;
    let options = data.notification;

    if(! options.tag ) {
        options.tag = DEFAULT_TAG;
    }

    event.waitUntil(registration.showNotification(title , options))
})