import { useEffect, useRef, useState, useCallback } from 'react';
import { signOut } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

export function useInactivityTimeout(timeoutMinutes = 10) {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const isModalShowingRef = useRef(false);
  
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  
  const TIMEOUT_DURATION = timeoutMinutes * 60 * 1000; // Total timeout in milliseconds
  const WARNING_TIME = TIMEOUT_DURATION * 0.8; // Show warning at 80% of timeout
  const WARNING_COUNTDOWN = TIMEOUT_DURATION - WARNING_TIME; // Time from warning to logout (20% of total)

  const handleLogout = useCallback(async () => {
    try {
      // Clear countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      // Clear all timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      
      setShowWarningModal(false);
      
      // Sign out from Cognito
      await signOut({ global: true });
      
      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if signOut fails
      navigate('/');
    }
  }, [navigate]);

  const startCountdown = useCallback(() => {
    const countdownSeconds = Math.floor(WARNING_COUNTDOWN / 1000);
    console.log(`⏳ Starting countdown: ${countdownSeconds} seconds`);
    setSecondsRemaining(countdownSeconds);
    
    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Update countdown every second
    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          console.log('⏰ Countdown reached zero - logging out');
          clearInterval(countdownIntervalRef.current);
          handleLogout();
          return 0;
        }
        console.log(`⏳ Countdown: ${prev - 1} seconds remaining`);
        return prev - 1;
      });
    }, 1000);
  }, [handleLogout, WARNING_COUNTDOWN]);

  const showWarning = useCallback(() => {
    console.log('⚠️  SHOWING INACTIVITY WARNING MODAL');
    setShowWarningModal(true);
    startCountdown();
  }, [startCountdown]);

  const handleStayLoggedIn = useCallback(() => {
    console.log('✅ User chose to stay logged in - resetting timer');
    setShowWarningModal(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // Timer will be reset by the activity detection in useEffect
  }, []);

  const resetTimer = useCallback(() => {
    const now = new Date();
    const warningTime = new Date(now.getTime() + WARNING_TIME);
    const logoutTime = new Date(now.getTime() + TIMEOUT_DURATION);
    
    // Clear existing timers
    if (timeoutRef.current) {
      console.log('⏹️  Clearing existing logout timer');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      console.log('⏹️  Clearing existing warning timer');
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Hide modal if it's showing
    setShowWarningModal(false);

    console.log(`⏱️  TIMER RESET at ${now.toLocaleTimeString()}`);
    console.log(`⚠️  Warning will show at: ${warningTime.toLocaleTimeString()} (in ${WARNING_TIME / 1000}s / ${(WARNING_TIME / 60000).toFixed(1)}min)`);
    console.log(`🚪 Auto-logout will occur at: ${logoutTime.toLocaleTimeString()} (in ${TIMEOUT_DURATION / 1000}s / ${(TIMEOUT_DURATION / 60000).toFixed(1)}min)`);

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      console.log('⚠️  WARNING TIMER FIRED! Showing modal...');
      showWarning();
    }, WARNING_TIME);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      console.log('🚪 LOGOUT TIMER FIRED! Logging out...');
      handleLogout();
    }, TIMEOUT_DURATION);
  }, [WARNING_TIME, TIMEOUT_DURATION, showWarning, handleLogout]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Track if modal is currently showing
    let isModalShowing = showWarningModal;

    // Reset timer on any user activity
    const resetOnActivity = () => {
      // Only reset if modal is not showing
      if (!isModalShowing) {
        console.log('👆 User activity detected - resetting timer');
        resetTimer();
      } else {
        console.log('⏸️  Activity detected but modal is showing - ignoring');
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity, { passive: true });
    });

    // Start the initial timer only on mount
    console.log('🚀 Initializing inactivity timer system');
    resetTimer();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up inactivity timer');
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetTimer]); // Only depend on resetTimer, which now doesn't depend on showWarningModal

  // Separate effect to update the modal state tracking
  useEffect(() => {
    // This just updates our tracking variable, doesn't reset timers
  }, [showWarningModal]);

  return { 
    showWarningModal, 
    secondsRemaining, 
    handleStayLoggedIn, 
    handleLogout 
  };
}