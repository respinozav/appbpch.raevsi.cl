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

  useEffect(() => {
    if (isLoggedIn) {
      refreshTimeoutConfig();
    }
  }, [isLoggedIn, refreshTimeoutConfig]);

  // 2. Activity listeners (resets lastActivityRef)
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

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
      const idleMs = now - lastActivityRef.current;
      const totalAllowedMs = timeoutMinutes * 60 * 1000;
      const warningWindowMs = 60 * 1000; // 1 minute warning

      if (idleMs >= totalAllowedMs) {
        setShowWarning(false);
        sessionStorage.setItem('inactivity_logout', 'true');
        onLogout('Sesión cerrada por inactividad');
      } else if (idleMs >= totalAllowedMs - warningWindowMs) {
        const remainingSec = Math.max(1, Math.ceil((totalAllowedMs - idleMs) / 1000));
        setSecondsRemaining(remainingSec);
        setShowWarning(true);
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, timeoutMinutes, showWarning, onLogout]);

  const extendSession = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  };

  return {
    timeoutMinutes,
    setTimeoutMinutes,
    refreshTimeoutConfig,
    showWarning,
    secondsRemaining,
    extendSession,
  };
}
