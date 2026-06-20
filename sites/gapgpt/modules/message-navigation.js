(function () {
  const gapgpt = window.siteEnhancer?.gapgpt;

  if (!gapgpt) {
    return;
  }

  const hostSelector = '.chat-wrapper .q-infinite-scroll';
  const messageSelector = '.chat-wrapper .q-infinite-scroll > [id^="message-"] .user-chat-box, .chat-wrapper .q-infinite-scroll > [id^="message-"] .bot-chat-box';
  const controlsClass = 'site-enhancer-message-nav';

  let controls = null;
  let previousButton = null;
  let nextButton = null;
  let updateQueued = false;
  let listenersBound = false;

  function getHost() {
    return document.querySelector(hostSelector);
  }

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

  function getVisibleMessageRange(messages) {
    let firstVisibleIndex = -1;
    let lastVisibleIndex = -1;

    messages.forEach(function (message, index) {
      const rect = message.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

      if (!isVisible) {
        return;
      }

      if (firstVisibleIndex === -1) {
        firstVisibleIndex = index;
      }

      lastVisibleIndex = index;
    });

    return {
      firstVisibleIndex,
      lastVisibleIndex,
    };
  }

  function ensureNavigationControls() {
    const host = getHost();

    if (!host) {
      return null;
    }

    if (!controls) {
      controls = document.createElement('div');
      controls.className = controlsClass;

      previousButton = createButton('previous', 'Scroll to previous message', function () {
        const messages = getMessages();
        const { firstVisibleIndex } = getVisibleMessageRange(messages);
        const targetIndex = firstVisibleIndex > 0 ? firstVisibleIndex - 1 : 0;

        if (messages[targetIndex]) {
          scrollToMessage(messages[targetIndex]);
        }
      });

      nextButton = createButton('next', 'Scroll to next message', function () {
        const messages = getMessages();
        const { lastVisibleIndex } = getVisibleMessageRange(messages);
        const targetIndex = lastVisibleIndex >= 0 ? lastVisibleIndex + 1 : messages.length - 1;

        if (messages[targetIndex]) {
          scrollToMessage(messages[targetIndex]);
        }
      });

      controls.append(previousButton, nextButton);
    }

    if (controls.parentElement !== host) {
      host.prepend(controls);
    }

    return controls;
  }

  function updateNavigationState() {
    const nav = ensureNavigationControls();

    if (!nav) {
      return;
    }

    const messages = getMessages();

    if (!messages.length) {
      nav.hidden = true;
      return;
    }

    const { firstVisibleIndex, lastVisibleIndex } = getVisibleMessageRange(messages);
    const hasPrevious = firstVisibleIndex > 0;
    const hasNext = lastVisibleIndex !== -1 && lastVisibleIndex < messages.length - 1;

    if (previousButton) {
      previousButton.hidden = !hasPrevious;
    }

    if (nextButton) {
      nextButton.hidden = !hasNext;
    }

    nav.hidden = !hasPrevious && !hasNext;
  }

  function scheduleUpdate() {
    if (updateQueued) {
      return;
    }

    updateQueued = true;

    window.requestAnimationFrame(function () {
      updateQueued = false;
      updateNavigationState();
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

  function bindListeners() {
    if (listenersBound) {
      return;
    }

    listenersBound = true;
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
  }

  gapgpt.register('messageNavigation', {
    init() {
      bindListeners();
    },

    refresh() {
      ensureNavigationControls();
      updateNavigationState();
    },
  });
})();
