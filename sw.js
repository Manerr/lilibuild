// sw.js
const CACHE_NAME = '.lilibuild-CACHE-2';
const FILES_TO_CACHE = [
  './',
  './logo2.svg',
  './index.html',
  './manifest.json',
  './style.css',
  './asidemenubar.css',
  './windows.css',
  './colors.css',
  './print.css',
  './favicon.png',
  './js/html-to-image.min.js',
  './js/Sortable.js',
  './js/domtoJSON.js',
  './js/eventManager.js',
  './js/main.js',
  './windows.js',
  './js/smalltools.js',
  './svgdata.js',
  './resources/DMSans-Light.ttf',
  './resources/Parisine-Bold.otf',
  './ui/new/picture.svg',
  './ui/new/print.svg',
  './ui/new/plus.svg',
  './ui/plus2.svg',
  './ui/new/download.svg',
  './ui/new/github.svg',
  './ui/new/pointer.svg',
  './ui/new/delete.svg',
  './ui/new/reset.svg',
  './ui/new/info.svg',
  './ui/new/open.svg',

  './blocks/connections/pointbis.svg',
  './blocks/connections/pointM.svg',
  './blocks/connections/pointRER.svg',
  './blocks/connections/pointTrain.svg',
  './blocks/connections/pointTram.svg',
  
  './blocks/connections/trams/t1.svg',
  './blocks/connections/trams/t2.svg',
  './blocks/connections/trams/t3A.svg',
  './blocks/connections/trams/t3B.svg',
  './blocks/connections/trams/t4.svg',
  './blocks/connections/trams/t5.svg',
  './blocks/connections/trams/t6.svg',
  './blocks/connections/trams/t7.svg',
  './blocks/connections/trams/t8.svg',
  './blocks/connections/trams/t9.svg',
  './blocks/connections/trams/t10.svg',
  './blocks/connections/trams/t11.svg',
  './blocks/connections/trams/t12.svg',
  './blocks/connections/trams/t13.svg',
  './blocks/connections/trams/t14.svg',


  './icons/icon-32x32.png',
  './icons/icon-512x512.png',
  './icons/icon-192x192.png',

];



self.addEventListener('install', event => {
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {

        FILES_TO_CACHE.forEach(file => {
          cache.add(file).catch((e)=>{console.log(e)})
        });

      })
      .catch(err => console.error('Cache install failed:', err))
  );
});



self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});


self.addEventListener('activate', async (event) => {

    const existingCaches = await caches.keys();
    const invalidCaches = existingCaches.filter(c => c !== CACHE_NAME);
    await Promise.all(invalidCaches.map(ic => caches.delete(ic)));

    // do whatever else you need to...

});