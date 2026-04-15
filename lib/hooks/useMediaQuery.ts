/**
 * Custom hook for responsive design.
 *
 * useSyncExternalStore lets us subscribe to a MediaQueryList without the
 * SSR hydration flash that the previous `useState(false) + useEffect`
 * implementation produced: on the server, the initial value matched what
 * the client would see only sometimes, and the first render on the client
 * always briefly returned `false` before flipping to the real match.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

function subscribe(query: string): (onStoreChange: () => void) => () => void {
  return (onStoreChange) => {
    if (typeof window === 'undefined') return () => {};
    const media = window.matchMedia(query);
    media.addEventListener('change', onStoreChange);
    return () => media.removeEventListener('change', onStoreChange);
  };
}

function getSnapshot(query: string): () => boolean {
  return () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };
}

function getServerSnapshot(): boolean {
  // During SSR we don't know the viewport — assume "does not match". Any
  // component that reads the value wraps it in a cheap guard, and the
  // initial client render will immediately replace the snapshot with the
  // real value on mount.
  return false;
}

export function useMediaQuery(query: string): boolean {
  const sub = useCallback(subscribe(query), [query]);
  const snap = useCallback(getSnapshot(query), [query]);
  return useSyncExternalStore(sub, snap, getServerSnapshot);
}

// Predefined breakpoint hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsTouchDevice() {
  // Touch detection needs one effect because `navigator.maxTouchPoints`
  // is not exposed through matchMedia. We accept one hydration flash.
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
}
