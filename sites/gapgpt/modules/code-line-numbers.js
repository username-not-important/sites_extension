(function() {
  if (typeof window.siteEnhancer === 'undefined' || !window.siteEnhancer.gapgpt) {
    return;
  }

  const gapgpt = window.siteEnhancer.gapgpt;

  function getLineCount(codeElement) {
    const text = codeElement.textContent || '';
    return text.split('\n').length;
  }

  function createLineNumbersContainer(lineCount) {
    const container = document.createElement('div');
    container.className = 'site-enhancer-line-numbers';

    for (let i = 1; i <= lineCount; i++) {
      const lineNum = document.createElement('span');
      lineNum.className = 'site-enhancer-line-number';
      lineNum.textContent = i;
      container.appendChild(lineNum);
    }

    return container;
  }

  function ensureLineNumbers() {
    const codeBlocks = document.querySelectorAll('pre.site-enhancer-code-collapsible');

    codeBlocks.forEach(block => {
      // Guard: check if line numbers already exist
      if (block.querySelector('.site-enhancer-line-numbers')) {
        return;
      }

      // Find the <code> element inside the pre
      const codeElement = block.querySelector('code');
      if (!codeElement) {
        return;
      }

      // Get line count
      const lineCount = getLineCount(codeElement);
      if (lineCount === 0) {
        return;
      }

      // Create and insert line numbers container
      const lineNumbersContainer = createLineNumbersContainer(lineCount);

      // Insert before the code element
      codeElement.parentNode.insertBefore(lineNumbersContainer, codeElement);

      // Mark the code block as having line numbers
      block.dataset.hasLineNumbers = 'true';
    });
  }

  gapgpt.register('codeLineNumbers', {
    init() {
      ensureLineNumbers();
    },

    refresh() {
      ensureLineNumbers();
    },
  });
})();
