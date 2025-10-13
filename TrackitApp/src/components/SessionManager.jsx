import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import { useWindowCloseLogout } from '../hooks/useWindowCloseLogout';
import { SessionWarningModal } from './SessionWarningModal';

export function SessionManager({ children }) {
  const { 
    showWarningModal, 
    secondsRemaining, 
    handleStayLoggedIn, 
    handleLogout 
  } = useInactivityTimeout(1); // 10 minutes - warning shows at 8 minute mark
  
  useWindowCloseLogout();
  
  return (
    <>
      {children}
      <SessionWarningModal
        isOpen={showWarningModal}
        secondsRemaining={secondsRemaining}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
    </>
  );
}