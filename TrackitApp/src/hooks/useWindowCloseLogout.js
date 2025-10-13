import { useEffect } from 'react';

export function useWindowCloseLogout() {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Clear all Cognito tokens from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('CognitoIdentityServiceProvider')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Note: We cannot use async signOut here as beforeunload
      // doesn't wait for async operations to complete.
      // Clearing tokens achieves the same effect - user will need to re-authenticate
    };

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}