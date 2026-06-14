(function () {
  const enhancer = window.siteEnhancer;
  const messageSelector = '.q-infinite-scroll > [id^="message-"] .user-chat-box, .q-infinite-scroll > [id^="message-"] .bot-chat-box';
  const controlsClass = 'site-enhancer-message-nav';
  const bottomCopyClass = 'site-enhancer-code-footer';
  const inlineCodeClass = 'site-enhancer-inline-code';
  const inlineCopyClass = 'site-enhancer-inline-code-copy';

  let floatingCopyButton = null;
  let currentCodeElement = null;

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

  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
    return Promise.resolve();
  }

  function setInlineCopyFeedback(button, text) {
    button.dataset.copyState = text;

    window.setTimeout(() => {
      if (button.dataset.copyState === text) {
        delete button.dataset.copyState;
      }
    }, 1200);
  }

  function createFloatingCopyButton() {
    const button = document.createElement('button');
    button.className = inlineCopyClass;
    button.type = 'button';
    button.textContent = '⧉';

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!currentCodeElement) return;

      const codeText = currentCodeElement.textContent.trim();

      copyText(codeText)
        .then(() => setInlineCopyFeedback(button, 'copied'))
        .catch(() => setInlineCopyFeedback(button, 'failed'));
    });

    document.body.appendChild(button);

    return button;
  }

  function positionButton(codeElement) {
    const rect = codeElement.getBoundingClientRect();

    floatingCopyButton.style.left =
      window.scrollX + rect.right - floatingCopyButton.offsetWidth + 'px';

    floatingCopyButton.style.top =
      window.scrollY + rect.top - floatingCopyButton.offsetHeight * 0.5 + rect.height * 0.5 + 'px';
  }

  function showButton(codeElement) {
    currentCodeElement = codeElement;
    positionButton(codeElement);
    floatingCopyButton.dataset.visible = 'true';
  }

  function hideButton() {
    currentCodeElement = null;
    delete floatingCopyButton.dataset.visible;
  }

  function enhanceInlineCode(codeElement) {
    if (
      codeElement.closest('pre') ||
      codeElement.classList.contains(inlineCodeClass)
    ) {
      return;
    }

    codeElement.classList.add(inlineCodeClass);

    codeElement.addEventListener('pointerenter', () => {
      showButton(codeElement);
    });

    codeElement.addEventListener('pointerleave', () => {
      hideButton();
    });
  }

  function refreshInlineCodeCopyButtons() {
    document.querySelectorAll('.markdown-container code').forEach(enhanceInlineCode);
  }

  function initInlineCopy() {
    floatingCopyButton = createFloatingCopyButton();

    window.addEventListener('scroll', () => {
      if (currentCodeElement) positionButton(currentCodeElement);
    });

    window.addEventListener('resize', () => {
      if (currentCodeElement) positionButton(currentCodeElement);
    });

    refreshInlineCodeCopyButtons();
  }

  function refreshEnhancements() {
    refreshMessageNavigation();
    refreshCodeCopyButtons();
    refreshInlineCodeCopyButtons();
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
    initInlineCopy();

    enhancer?.log('GapGPT enhancements loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
