(function () {
  const siteNameByHost = {
    'chat.avalai.ir': 'AvalAI',
    'gapgpt.app': 'GapGPT',
  };
  const siteName = siteNameByHost[window.location.hostname] || 'AI site';

  window.siteEnhancer = {
    siteName,
    log(message) {
      console.log(`[Site Enhancer:${siteName}] ${message}`);
    },
  };

  window.siteEnhancer.log('shared runtime loaded');
})();
