(function () {
  const enhancer = window.siteEnhancer;
  const messageSelector = '.q-infinite-scroll > [id^="message-"]';
  const controlsClass = 'site-enhancer-message-nav';

  function getMessages() {
    return Array.from(document.querySelectorAll(messageSelector));
  }

  function scrollToMessage(message) {
    message.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }

  function createButton(direction, label, onClick) {
    const button = document.createElement('button');
    button.className = `site-enhancer-nav-button site-enhancer-nav-button-${direction}`;
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.textContent = direction === 'previous' ? '↑' : '↓';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  function addNavigationControls(message) {
    if (message.querySelector(`:scope > .${controlsClass}`)) {
      return;
    }

    const controls = document.createElement('div');
    controls.className = controlsClass;

    controls.append(
      createButton('previous', 'Scroll to previous message', function () {
        const messages = getMessages();
        const index = messages.indexOf(message);
        scrollToMessage(messages[Math.max(index - 1, 0)]);
      }),
      createButton('next', 'Scroll to next message', function () {
        const messages = getMessages();
        const index = messages.indexOf(message);
        scrollToMessage(messages[Math.min(index + 1, messages.length - 1)]);
      }),
    );

    message.appendChild(controls);
  }

  function refreshMessageNavigation() {
    const messages = getMessages();

    messages.forEach(function (message) {
      addNavigationControls(message);
    });
  }

  function observeMessages() {
    const observer = new MutationObserver(function () {
      refreshMessageNavigation();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    document.documentElement.dataset.siteEnhancer = 'gapgpt';
    refreshMessageNavigation();
    observeMessages();
    enhancer?.log('GapGPT enhancements loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
