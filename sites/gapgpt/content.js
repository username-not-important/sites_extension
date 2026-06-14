(function () {
  const enhancer = window.siteEnhancer;
  const messageSelector = '.q-infinite-scroll > [id^="message-"] .user-chat-box, .q-infinite-scroll > [id^="message-"] .bot-chat-box';
  const controlsClass = 'site-enhancer-message-nav';
  const bottomCopyClass = 'site-enhancer-code-footer';

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
    controls.dataset.messageType = message.classList.contains('user-chat-box') ? 'user' : 'assistant';

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

  function getTopCopyButton(codeBlock) {
    return codeBlock.querySelector('.code-header button[onclick*="copyFunc"], .code-header button[aria-label*="copy" i], .code-header button[title*="copy" i]');
  }

  function addBottomCopyButton(codeBlock) {
    if (codeBlock.querySelector(`:scope > .${bottomCopyClass}`)) {
      return;
    }

    const topCopyButton = getTopCopyButton(codeBlock);

    if (!topCopyButton) {
      return;
    }

    const footer = document.createElement('div');
    footer.className = bottomCopyClass;

    const bottomCopyButton = topCopyButton.cloneNode(true);
    bottomCopyButton.classList.add('site-enhancer-code-copy-bottom');
    bottomCopyButton.removeAttribute('style');
    bottomCopyButton.removeAttribute('onclick');
    bottomCopyButton.title = topCopyButton.title || 'Copy code';
    bottomCopyButton.setAttribute('aria-label', bottomCopyButton.getAttribute('aria-label') || 'Copy code');
    bottomCopyButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      topCopyButton.click();
    });

    footer.appendChild(bottomCopyButton);
    codeBlock.appendChild(footer);
  }

  function refreshCodeCopyButtons() {
    document.querySelectorAll('pre').forEach(function (codeBlock) {
      addBottomCopyButton(codeBlock);
    });
  }

  function refreshEnhancements() {
    refreshMessageNavigation();
    refreshCodeCopyButtons();
  }

  function observeMessages() {
    const observer = new MutationObserver(function () {
      refreshEnhancements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    document.documentElement.dataset.siteEnhancer = 'gapgpt';
    refreshEnhancements();
    observeMessages();
    enhancer?.log('GapGPT enhancements loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
