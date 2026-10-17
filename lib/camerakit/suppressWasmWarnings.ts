'use client';

/**
 * Suppress harmless LensCore / Emscripten WASM internal notices and warnings
 * from triggering Next.js 15 dev overlay in development mode.
 */
if (typeof window !== 'undefined' && !(window as any).__snap_wasm_suppressed) {
  (window as any).__snap_wasm_suppressed = true;

  const isWasmNotice = (args: any[]): boolean => {
    try {
      for (const arg of args) {
        if (!arg) continue;
        const str =
          typeof arg === 'string'
            ? arg
            : arg instanceof Error
            ? `${arg.message} ${arg.stack || ''}`
            : typeof arg === 'object'
            ? `${(arg as any).message || ''} ${(arg as any).stack || ''} ${JSON.stringify(arg)}`
            : String(arg);

        if (
          str.includes('createWeightBuffer') ||
          str.includes('Workspace::') ||
          str.includes('source size (100) != expected (98)') ||
          str.includes('Module already initialized') ||
          str.includes('LensCoreUncategorizedError')
        ) {
          return true;
        }
      }
    } catch {
      // Ignore serialization issues
    }
    return false;
  };

  const origError = window.console.error;
  window.console.error = (...args: any[]) => {
    if (isWasmNotice(args)) {
      console.debug('[Snap CameraKit Notice]:', ...args);
      return;
    }
    origError.apply(window.console, args);
  };

  const origWarn = window.console.warn;
  window.console.warn = (...args: any[]) => {
    if (isWasmNotice(args)) {
      console.debug('[Snap CameraKit Notice]:', ...args);
      return;
    }
    origWarn.apply(window.console, args);
  };

  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || '';
      if (
        msg.includes('createWeightBuffer') ||
        msg.includes('Workspace::') ||
        msg.includes('source size (100) != expected (98)') ||
        msg.includes('Module already initialized') ||
        msg.includes('LensCoreUncategorizedError')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.debug('[Snap CameraKit Error Suppressed]:', msg);
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event?.reason;
      const str = String(reason?.message || reason || '');
      if (
        str.includes('createWeightBuffer') ||
        str.includes('Workspace::') ||
        str.includes('source size (100) != expected (98)') ||
        str.includes('Module already initialized') ||
        str.includes('LensCoreUncategorizedError')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.debug('[Snap CameraKit Rejection Suppressed]:', str);
      }
    },
    true
  );
}
