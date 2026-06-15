(function () {
  const gapgpt = window.siteEnhancer?.gapgpt;

  if (!gapgpt) {
    return;
  }

  const inlineCopyClass = 'site-enhancer-inline-code-copy';
  let currentCodeElement = null;
  let hideTimeout = null;
  let floatingCopyButton = null;
  let initialized = false;

  function scheduleHide() {
    hideTimeout = setTimeout(function () {
      floatingCopyButton.dataset.visible = 'false';
      currentCodeElement = null;
    }, 200);
  }

  function getOrCreateFloatingButton() {
    if (floatingCopyButton) {
      return floatingCopyButton;
    }

    const button = document.createElement('button');
    button.className = inlineCopyClass;
    button.type = 'button';
    button.textContent = '⧉';

    button.addEventListener('pointerenter', function () {
      clearTimeout(hideTimeout);
    });
    button.addEventListener('pointerleave', function () {
      scheduleHide();
    });

    button.addEventListener('click', function (event) {
      event.preventDefault();

      if (!currentCodeElement) {
        return;
      }

      navigator.clipboard.writeText(currentCodeElement.textContent.trim())
        .then(function () {
          button.dataset.copyState = 'copied';
          setTimeout(function () {
            delete button.dataset.copyState;
          }, 1500);
        });
    });

    document.body.appendChild(button);
    floatingCopyButton = button;
    return button;
  }

  function positionButton(codeElement) {
    const button = getOrCreateFloatingButton();
    const rect = codeElement.getBoundingClientRect();

    button.style.left = `${window.scrollX + rect.right + 4}px`;
    button.style.top = `${window.scrollY + rect.top - 2}px`;
  }

  function initDelegation() {
    document.addEventListener('pointerenter', function (event) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const code = event.target.closest('.markdown-container code:not(pre code)');
      if (!code) {
        return;
      }

      clearTimeout(hideTimeout);
      currentCodeElement = code;

      const button = getOrCreateFloatingButton();
      positionButton(code);
      button.dataset.visible = 'true';
    }, true);

    document.addEventListener('pointerleave', function (event) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (event.target.closest('.markdown-container code:not(pre code)')) {
        scheduleHide();
      }
    }, true);
  }

  gapgpt.register('inlineCodeCopy', {
    init() {
      if (initialized) {
        return;
      }

      initialized = true;
      initDelegation();
    },

    refresh() { },
  });
})();
