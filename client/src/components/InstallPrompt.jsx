import { useCallback, useEffect, useState } from 'react';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(window.navigator.userAgent);
}

const DISMISS_KEY = 'flowgenix_pwa_install_dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return undefined;

    if (isIos()) {
      setMode('ios');
      setVisible(true);
      return undefined;
    }

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setMode('android');
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setVisible(false);
    }
  };

  if (!visible || !mode) return null;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-50 mx-auto max-w-lg lg:left-auto lg:right-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-navy/10">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy">
            <svg className="h-6 w-6 text-teal" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 18V6h3l3 6 3-6h3v12h-2.5V9.5L13.5 18h-1.5l-1.5-8.5V18H6z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-navy">Install Flowgenix Lite</p>
            {mode === 'android' ? (
              <p className="mt-1 text-sm text-gray-500">
                Add to your home screen for quick access to your document vault.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                On iPhone: tap <span className="font-medium text-navy">Share</span> in Safari, then{' '}
                <span className="font-medium text-navy">Add to Home Screen</span>.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Dismiss install prompt"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === 'ios' && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <svg className="h-5 w-5 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M12 15.75l-3-3m0 0l3-3m-3 3h7.5V3.75" />
            </svg>
            Share icon is at the bottom of Safari on iPhone.
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {mode === 'android' && (
            <button type="button" onClick={handleInstall} className="btn-primary flex-1 py-2 text-sm">
              Install app
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className={`btn-outline py-2 text-sm ${mode === 'android' ? '' : 'flex-1'}`}
          >
            {mode === 'ios' ? 'Got it' : 'Not now'}
          </button>
        </div>
      </div>
    </div>
  );
}
