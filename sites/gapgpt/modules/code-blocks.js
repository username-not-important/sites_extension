(function () {
  const gapgpt = window.siteEnhancer?.gapgpt;

  if (!gapgpt) {
    return;
  }

  const bottomCopyClass = 'site-enhancer-code-footer';
  const collapsibleCodeClass = 'site-enhancer-code-collapsible';
  const collapseButtonClass = 'site-enhancer-code-collapse';

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

  function setCodeBlockCollapsed(codeBlock, collapsed) {
    const codeBody = codeBlock.querySelector(':scope > code');
    const collapseButton = codeBlock.querySelector(`:scope > .code-header .${collapseButtonClass}`);

    if (!codeBody) {
      return;
    }

    codeBlock.dataset.collapsed = String(collapsed);
    collapseButton?.setAttribute('aria-expanded', String(!collapsed));
    collapseButton?.setAttribute('title', collapsed ? 'Expand code' : 'Collapse code');
    collapseButton?.setAttribute('aria-label', collapsed ? 'Expand code' : 'Collapse code');

    if (collapsed) {
      codeBody.style.maxHeight = `${codeBody.scrollHeight}px`;
      codeBody.offsetHeight;
      codeBody.style.maxHeight = '0px';
      return;
    }

    codeBody.style.maxHeight = `${codeBody.scrollHeight}px`;

    codeBody.addEventListener('transitionend', function handleTransition(event) {
      if (event.propertyName !== 'max-height' || codeBlock.dataset.collapsed === 'true') {
        return;
      }

      codeBody.style.maxHeight = '';
      codeBody.removeEventListener('transitionend', handleTransition);
    });
  }

  function addCodeCollapseButton(codeBlock) {
    const header = codeBlock.querySelector(':scope > .code-header');
    const codeBody = codeBlock.querySelector(':scope > code');

    if (!header || !codeBody) {
      return;
    }

    codeBlock.classList.add(collapsibleCodeClass);
    header.classList.add('site-enhancer-code-header');

    if (header.querySelector(`:scope > .${collapseButtonClass}`)) {
      return;
    }

    const button = document.createElement('button');
    button.className = collapseButtonClass;
    button.type = 'button';
    button.title = 'Collapse code';
    button.setAttribute('aria-label', 'Collapse code');
    button.setAttribute('aria-expanded', 'true');

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setCodeBlockCollapsed(codeBlock, codeBlock.dataset.collapsed !== 'true');
    });

    header.appendChild(button);
  }

  gapgpt.register('codeBlocks', {
    init() {},

    refresh() {
      document.querySelectorAll('pre').forEach(function (codeBlock) {
        addCodeCollapseButton(codeBlock);
        addBottomCopyButton(codeBlock);
      });
    },
  });
})();
