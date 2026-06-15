(function () {
  const enhancer = window.siteEnhancer;
  const features = {};
  let initialized = false;
  let observer = null;

  enhancer.avalai = {
    register(name, feature) {
      features[name] = feature;

      if (initialized && typeof feature.init === 'function') {
        feature.init();
      }

      if (initialized && typeof feature.refresh === 'function') {
        feature.refresh();
      }
    },

    refresh() {
      Object.values(features).forEach(function (feature) {
        if (typeof feature.refresh === 'function') {
          feature.refresh();
        }
      });
    },
  };

  enhancer?.log('AvalAI enhancements loaded');

  function initFeatures() {
    Object.values(features).forEach(function (feature) {
      if (typeof feature.init === 'function') {
        feature.init();
      }
    });
  }

  function observeMessages() {
    if (observer || !document.body) {
      return;
    }

    observer = new MutationObserver(function () {
      enhancer.avalai.refresh();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    initialized = true;
    document.documentElement.dataset.siteEnhancer = 'avalai';
    initFeatures();
    enhancer.avalai.refresh();
    observeMessages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
