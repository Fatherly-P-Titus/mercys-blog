/**
 * Register Service Worker for PWA
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (reg) {
        console.log('Service Worker registered:', reg.scope);
      })
      .catch(function (err) {
        console.warn('Service Worker registration failed:', err);
      });
  });
}
