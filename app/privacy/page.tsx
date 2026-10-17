import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Snap Meet',
  description: 'Privacy Policy for Snap Meet real-time video conferencing application.',
};

export default function PrivacyPage() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        background: 'radial-gradient(circle at 50% 18%, #161928 0%, #0d0f18 55%, #07080d 100%)',
        color: '#ffffff',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '3rem 1.5rem 5rem',
      }}
    >
      <div
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          background: 'rgba(20, 24, 38, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2.5rem',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#FF6352',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Snap Meet
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Last updated: October 17, 2026
        </p>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            1. Overview
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Snap Meet (&quot;we&quot;, &quot;our&quot;, or &quot;the application&quot;) is a real-time WebRTC video conferencing application built to facilitate interactive, encrypted video communication with augmented reality (AR) face effects powered by the Snap Camera Kit Web SDK. We are committed to protecting user privacy and ensuring full transparency regarding data handling.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            2. Camera and Microphone Access
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Snap Meet requires user permission to access your device&apos;s camera and microphone strictly for transmitting live video and audio streams to other meeting participants. Camera frames are also utilized locally for AR lens processing.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            You retain complete control over your hardware at all times and can mute your microphone or disable your camera via the meeting control bar.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            3. Snap Camera Kit &amp; Facial Processing
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Our AR lenses and face tracking features are powered by Snap Inc.&apos;s official Camera Kit Web SDK. All facial landmark detection, mesh deformation, and AR rendering are executed locally within your web browser via WebAssembly (WASM) and WebGL.
          </p>
          <ul style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem', paddingLeft: '1.25rem' }}>
            <li>We do not store, log, or export your biometric data or facial geometry.</li>
            <li>Facial tracking data is used solely in real time to position AR lenses on screen and is discarded immediately after frame rendering.</li>
            <li>No personal identification or facial data is shared with third-party advertisers.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            4. Real-Time Media Transmission
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Video calls are routed through LiveKit Cloud infrastructure using standard WebRTC encryption protocols (DTLS/SRTP). Optional end-to-end encryption (E2EE) is available for users requiring zero-knowledge meeting confidentiality.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            5. Contact and Open Source
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Snap Meet is an open-source project. If you have questions regarding this Privacy Policy or data security practices, please contact the developer via the official repository:
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <a
              href="https://github.com/KunalGhadge/SnapMeet"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#FF7565', textDecoration: 'underline' }}
            >
              https://github.com/KunalGhadge/SnapMeet
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
