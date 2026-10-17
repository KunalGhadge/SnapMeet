import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Snap Meet',
  description: 'Terms and Conditions for Snap Meet video conferencing application.',
};

export default function TermsPage() {
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
          Terms and Conditions
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Last updated: October 17, 2026
        </p>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            By accessing or using Snap Meet, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you must not use our service.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            2. Permitted Use &amp; Code of Conduct
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Snap Meet is provided for real-time peer-to-peer video communication. You agree not to use the application to transmit unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable material, or to violate any local, state, national, or international law.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            3. Snap Camera Kit &amp; Third-Party AR Services
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Augmented Reality features and lenses in Snap Meet are powered by the Snap Camera Kit Web SDK provided by Snap Inc. Users must comply with Snap&apos;s Terms of Service and acceptable use policies when engaging with AR features.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            4. Service Availability &amp; Disclaimer
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Snap Meet is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. We do not warrant that video call quality will be error-free or uninterrupted, as real-time WebRTC media depends on local hardware and network conditions.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FF7565', marginBottom: '0.75rem' }}>
            5. Open Source License
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Snap Meet source code is released under the Apache License 2.0. Contributions and code repositories are accessible via:
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
