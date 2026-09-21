// Guarda la respuesta en el cache dinamico y la devuelve.
// El clone() es obligatorio: un body de Response solo se puede leer una vez,
// asi que una copia va al cache y la original al navegador.
function actualizaCacheDinamico(dynamicCache, req, res) {

    if (!res.ok && res.type !== 'opaque') {
        return res;
    }

    const copia = res.clone();

    return caches.open(dynamicCache).then(cache => {
        cache.put(req, copia);
        return res;
    });
}

// Evita que el cache dinamico crezca sin limite.
function limpiarCache(nombreCache, numeroItems) {
    caches.open(nombreCache).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > numeroItems) {
                cache.delete(keys[0]).then(() => limpiarCache(nombreCache, numeroItems));
            }
        });
    });
}
