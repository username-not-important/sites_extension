(function () {
  const enhancer = window.siteEnhancer;
  const features = {};
  let initialized = false;
  let observer = null;

  enhancer.gapgpt = {
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
      enhancer.gapgpt.refresh();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    initialized = true;
    document.documentElement.dataset.siteEnhancer = 'gapgpt';
    initFeatures();
    enhancer.gapgpt.refresh();
    observeMessages();

    enhancer?.log('GapGPT enhancements loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
