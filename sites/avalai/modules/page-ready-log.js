(function () {
  const avalai = window.siteEnhancer?.avalai;
  let initialized = false;

  if (!avalai) {
    return;
  }

  avalai.register('pageReadyLog', {
    init() {
      if (initialized) {
        return;
      }

      initialized = true;
      window.siteEnhancer?.log('page ready');
    },

    refresh() {},
  });
})();
