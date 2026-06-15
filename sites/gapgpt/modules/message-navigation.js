(function () {
  const gapgpt = window.siteEnhancer?.gapgpt;

  if (!gapgpt) {
    return;
  }

  const messageSelector = '.q-infinite-scroll > [id^="message-"] .user-chat-box, .q-infinite-scroll > [id^="message-"] .bot-chat-box';
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

  gapgpt.register('messageNavigation', {
    init() {},

    refresh() {
      getMessages().forEach(function (message) {
        addNavigationControls(message);
      });
    },
  });
})();
