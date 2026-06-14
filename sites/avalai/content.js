(function () {
  const enhancer = window.siteEnhancer;

  enhancer?.log('AvalAI enhancements loaded');

  document.addEventListener('DOMContentLoaded', function () {
    enhancer?.log('page ready');
  });
})();
