'use client';

import React, { useState } from 'react';

interface TermsConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel?: () => void;
}

export function hasAgreedToConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('snapmeet_consent_agreed') === 'true';
}

export function markConsentAgreed(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('snapmeet_consent_agreed', 'true');
  }
}

export function TermsConsentModal({ isOpen, onAccept, onCancel }: TermsConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAgreeAndContinue = () => {
    markConsentAgreed();
    onAccept();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '490px',
          background: '#141724',
          border: '1px solid rgba(255, 99, 82, 0.35)',
          borderRadius: '20px',
          padding: '2rem 2.25rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(255, 99, 82, 0.15)',
          color: '#ffffff',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF7565 0%, #FF513E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(255, 99, 82, 0.35)',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Terms &amp; Privacy Agreement
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              One-time review before your first call
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.875rem',
            lineHeight: 1.55,
            color: 'rgba(255, 255, 255, 0.82)',
            margin: '0 0 1rem',
          }}
        >
          Welcome to Snap Meet. Before connecting to your first video call, please review and accept our policies:
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            margin: '0 0 1.25rem',
            padding: '0.85rem 1rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.825rem',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF7565"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: '2px' }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Live video and audio are securely encrypted via WebRTC for peer-to-peer conferencing.</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.825rem',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF7565"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: '2px' }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>
              Snap AR lenses are processed locally on-device. No facial geometry or biometric data is stored or shared.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <input
            id="terms-consent-check"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#FF6352',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          <label
            htmlFor="terms-consent-check"
            style={{
              fontSize: '0.825rem',
              color: 'rgba(255, 255, 255, 0.85)',
              cursor: 'pointer',
              lineHeight: 1.4,
            }}
          >
            I agree to the{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#FF7565', textDecoration: 'underline' }}
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#FF7565', textDecoration: 'underline' }}
            >
              Terms &amp; Conditions
            </a>
            .
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            disabled={!agreed}
            onClick={handleAgreeAndContinue}
            style={{
              flex: onCancel ? 2 : 1,
              padding: '0.75rem',
              background: agreed
                ? 'linear-gradient(135deg, #FF6352 0%, #E04838 100%)'
                : 'rgba(255, 99, 82, 0.25)',
              border: 'none',
              borderRadius: '10px',
              color: agreed ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: agreed ? 'pointer' : 'not-allowed',
              boxShadow: agreed ? '0 4px 16px rgba(255, 99, 82, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
