import "../styles/copyCode.scss";

// https://github.com/vuejs/vitepress/blob/v2.0.0-alpha.16/src/client/app/composables/copyCode.ts
export function useCopyCode() {
  const timeoutIdMap = new WeakMap<HTMLElement, number>();
  window.addEventListener('click', (e) => {
    const btn = e.target as HTMLElement;
    if (!btn.matches('div[class*="code-wrapper"] > button.copy')) {
      return;
    }
    const pre = btn.parentElement?.querySelector('pre[class*="z-code"]') as HTMLElement;
    if (!pre) {
      return;
    }

    const text = pre.dataset.rawCode || pre.innerText || '';

    copyToClipboard(text).then(() => {
      btn.classList.add('copied');
      clearTimeout(timeoutIdMap.get(btn));
      const timeoutId = setTimeout(() => {
        btn.classList.remove('copied');
        btn.blur();
        timeoutIdMap.delete(btn);
      }, 2000);
      timeoutIdMap.set(btn, timeoutId);
    });

  });
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const element = document.createElement('textarea');
    const previouslyFocusedElement = document.activeElement;

    element.value = text;

    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '');

    element.style.contain = 'strict';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.fontSize = '12pt'; // Prevent zooming on iOS

    const selection = document.getSelection();
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null;

    document.body.appendChild(element);
    element.select();

    // Explicit selection workaround for iOS
    element.selectionStart = 0;
    element.selectionEnd = text.length;

    const successful = document.execCommand('copy');
    document.body.removeChild(element);

    if (originalRange) {
      selection!.removeAllRanges(); // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange);
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      (previouslyFocusedElement as HTMLElement).focus();
    }

    if (!successful) {
      return Promise.reject("Clipboard and fallback both failed.");
    }
  }
}
