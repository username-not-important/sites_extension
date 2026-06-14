(function () {
  const enhancer = window.siteEnhancer;

  enhancer?.log('GapGPT placeholder enhancements loaded');

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.dataset.siteEnhancer = 'gapgpt';
    enhancer?.log('placeholder hooks ready');
  });
})();
