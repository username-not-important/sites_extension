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

  function findPreviousMessageTarget(messages) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];

      if (message.getBoundingClientRect().top < 0) {
        return message;
      }
    }

    return null;
  }

  function findNextMessageTarget(messages) {
    const sightLine = window.innerHeight * 0.5;

    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index];

      if (message.getBoundingClientRect().top >= sightLine) {
        return message;
      }
    }

    return null;
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
        const target = findPreviousMessageTarget(messages);

        if (target) {
          scrollToMessage(target);
        }
      });

      nextButton = createButton('next', 'Scroll to next message', function () {
        const messages = getMessages();
        const target = findNextMessageTarget(messages);

        if (target) {
          scrollToMessage(target);
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

    const hasPrevious = Boolean(findPreviousMessageTarget(messages));
    const hasNext = Boolean(findNextMessageTarget(messages));

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
