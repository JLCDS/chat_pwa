importScripts('./js/sw-utils.js');

const STATIC_CACHE = 'static-v4';
const DYNAMIC_CACHE = 'dynamic-v4';
const INMUTABLE_CACHE = 'inmutable-v4';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './js/app.js',
    './img/avatars/spiderman.jpg',
    './img/avatars/ironman.jpg',
    './img/avatars/wolverine.jpg',
    './img/avatars/thor.jpg',
    './img/avatars/hulk.jpg',
    './img/favicon.ico'
];
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    './css/animate.css',
    './js/libs/jquery.js'
];

self.addEventListener('install', e => {
    const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(APP_SHELL));
    // Modificamos el manejo del cache inmutable
    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => {
        return Promise.all(
            APP_SHELL_INMUTABLE.map(url => {
                // Si la URL es externa, usamos un fetch manual con no-cors
                if (url.includes('http')) {
                    return fetch(url, { mode: 'no-cors' })
                        .then(resp => cache.put(url, resp));
                }
                // Si es local, normal
                return cache.add(url);
            })
        );
    });
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));

    // Activa este SW en cuanto termine de instalar, sin esperar a que se
    // cierren las pestañas que controla el SW anterior.
    self.skipWaiting();
});

self.addEventListener('activate', e => {

    // Borra CUALQUIER cache que no sea de la version actual, no solo las 'static'.
    const cachesActuales = [STATIC_CACHE, DYNAMIC_CACHE, INMUTABLE_CACHE];

    const respuesta = caches.keys().then(keys =>
        Promise.all(
            keys.filter(key => !cachesActuales.includes(key))
                .map(key => {
                    console.log('SW: borrando cache antiguo', key);
                    return caches.delete(key);
                })
        )
    // Toma el control de las pestañas ya abiertas sin necesidad de recargar.
    ).then(() => self.clients.claim());

    e.waitUntil(respuesta);
});

self.addEventListener('fetch', e => {

    // Solo GET: cache.put() lanza TypeError con POST/PUT y rompe la respuesta.
    if (e.request.method !== 'GET') {
        return;
    }

    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res;
        } else {
            return fetch(e.request).then(newRes => {
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            });
        }
    });
    e.respondWith(respuesta);
});