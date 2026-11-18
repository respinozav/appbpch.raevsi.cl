import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';

export function useSessionTimeout(
  isLoggedIn: boolean,
  onLogout: (reason?: string) => void
) {
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(30);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartedAtRef = useRef<number>(Date.now());

  // Helper to reset activity timestamp
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  }, []);

  // 1. Fetch current timeout setting from API
  const refreshTimeoutConfig = useCallback(async () => {
    try {
      const conf = await api.getSessionConfig();
      if (conf?.timeout_minutes && conf.timeout_minutes >= 5) {
        setTimeoutMinutes(conf.timeout_minutes);
      }
    } catch {
      // Fallback to default 30 min
      setTimeoutMinutes(30);
    }
  }, []);

  // Reset activity whenever the user logs in
  useEffect(() => {
    if (isLoggedIn) {
      lastActivityRef.current = Date.now();
      sessionStartedAtRef.current = Date.now();
      setShowWarning(false);
      refreshTimeoutConfig();
    }
  }, [isLoggedIn, refreshTimeoutConfig]);

  // 2. Activity listeners (resets lastActivityRef)
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning((prev) => (prev ? false : prev));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttle listener to avoid high CPU usage
    let lastThrottled = 0;
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastThrottled > 1000) {
        lastThrottled = now;
        handleUserActivity();
      }
    };

    events.forEach((ev) => window.addEventListener(ev, throttledHandler, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, throttledHandler));
    };
  }, [isLoggedIn, handleUserActivity]);

  // 3. Heartbeat check interval
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // Grace period: never disconnect within the first 10 seconds of login
      if (now - sessionStartedAtRef.current < 10000) {
        return;
      }

      const idleMs = now - lastActivityRef.current;
      const effectiveTimeout = timeoutMinutes >= 5 ? timeoutMinutes : 30;
      const totalAllowedMs = effectiveTimeout * 60 * 1000;
      const warningWindowMs = 60 * 1000; // 1 minute warning

      if (idleMs >= totalAllowedMs) {
        setShowWarning(false);
        onLogout('Sesión cerrada por inactividad');
      } else if (idleMs >= totalAllowedMs - warningWindowMs) {
        const remainingSec = Math.max(1, Math.ceil((totalAllowedMs - idleMs) / 1000));
        setSecondsRemaining(remainingSec);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, timeoutMinutes, onLogout]);

  const extendSession = () => {
    resetActivity();
  };

  return {
    timeoutMinutes,
    setTimeoutMinutes,
    refreshTimeoutConfig,
    showWarning,
    secondsRemaining,
    extendSession,
    resetActivity,
  };
}
