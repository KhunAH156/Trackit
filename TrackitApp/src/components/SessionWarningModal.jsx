import React, { useState, useEffect } from 'react';

// SessionWarningModal.jsx
export function SessionWarningModal({ isOpen, onStayLoggedIn, onLogout, secondsRemaining }) {
  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 24px',
          backgroundColor: '#FEF3C7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1F2937',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          Session Expiring Soon
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          For your security, you will be automatically logged out due to inactivity.
        </p>

        {/* Countdown Timer */}
        <div style={{
          backgroundColor: '#FEF3C7',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#92400E',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Time Remaining
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#B45309',
            fontFamily: 'monospace'
          }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column'
        }}>
          <button
            onClick={onStayLoggedIn}
            style={{
              width: '100%',
              backgroundColor: '#4F46E5',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338CA'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4F46E5'}
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              backgroundColor: 'white',
              color: '#6B7280',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#F9FAFB';
              e.target.style.borderColor = '#D1D5DB';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#E5E7EB';
            }}
          >
            Logout Now
          </button>
        </div>

        {/* Security Note */}
        <p style={{
          fontSize: '12px',
          color: '#9CA3AF',
          textAlign: 'center',
          marginTop: '16px',
          lineHeight: '1.4'
        }}>
          🔒 This is for your security when using shared or public devices
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Demo Component
export default function SessionWarningDemo() {
  const [isOpen, setIsOpen] = useState(true);
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    if (!isOpen || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, seconds]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Session Warning Modal Demo</h1>
      <p>This modal will appear when the user has been inactive for 13 minutes.</p>
      <button 
        onClick={() => {
          setIsOpen(true);
          setSeconds(120);
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        Show Modal (Demo)
      </button>

      <SessionWarningModal
        isOpen={isOpen}
        secondsRemaining={seconds}
        onStayLoggedIn={() => {
          setIsOpen(false);
          alert('Timer reset! User will stay logged in.');
        }}
        onLogout={() => {
          setIsOpen(false);
          alert('User logged out.');
        }}
      />
    </div>
  );
}