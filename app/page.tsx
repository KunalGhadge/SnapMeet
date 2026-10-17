'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

// Dynamic import with ssr: false for WebGL2 canvas compatibility
const PixelSnow = dynamic<any>(() => import('@/lib/PixelSnow'), { ssr: false });

function Tabs(props: React.PropsWithChildren<{}>) {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get('tab') === 'join' ? 1 : 0;

  const router = useRouter();
  function onTabSelected(index: number) {
    const tab = index === 1 ? 'join' : 'start';
    router.push(`/?tab=${tab}`);
  }

  let tabs = React.Children.map(props.children, (child, index) => {
    const isActive = tabIndex === index;
    return (
      <button
        type="button"
        className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
        onClick={() => {
          if (onTabSelected) {
            onTabSelected(index);
          }
        }}
        aria-pressed={isActive}
      >
        {/* @ts-ignore */}
        {child?.props.label}
      </button>
    );
  });

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabSelect}>{tabs}</div>
      {/* @ts-ignore */}
      {props.children[tabIndex]}
    </div>
  );
}

function StartCallTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const startMeeting = () => {
    if (e2ee) {
      router.push(`/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`);
    } else {
      router.push(`/rooms/${generateRoomId()}`);
    }
  };

  return (
    <div className={styles.tabContent}>
      <p className={styles.description}>
        Start an instant video call with real-time Snap AR lenses and face effects.
      </p>
      <button className={styles.actionButton} onClick={startMeeting} type="button">
        Start New Call
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.65rem', alignItems: 'center' }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
            style={{ accentColor: '#FF6352', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="use-e2ee" style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}>
            Enable end-to-end encryption
          </label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="passphrase" style={{ fontSize: '0.825rem', color: 'rgba(255, 255, 255, 0.65)' }}>
              Passphrase
            </label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
              className={styles.input}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function JoinCallTab(props: { label: string }) {
  const router = useRouter();
  const [roomInput, setRoomInput] = useState('');
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState('');

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    let cleaned = roomInput.trim();
    if (!cleaned) return;

    // Handle full URL pasted (e.g. https://domain.com/rooms/abc-1234 or /rooms/abc-1234)
    if (cleaned.includes('/rooms/')) {
      const parts = cleaned.split('/rooms/');
      cleaned = parts[parts.length - 1].split('?')[0].split('#')[0];
    } else if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      try {
        const url = new URL(cleaned);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        cleaned = pathSegments[pathSegments.length - 1] || cleaned;
      } catch (e) {
        // Fallback
      }
    }

    if (e2ee && sharedPassphrase) {
      router.push(`/rooms/${encodeURIComponent(cleaned)}#${encodePassphrase(sharedPassphrase)}`);
    } else {
      router.push(`/rooms/${encodeURIComponent(cleaned)}`);
    }
  };

  return (
    <form className={styles.tabContent} onSubmit={onSubmit}>
      <p className={styles.description}>
        Join an existing call by entering a room code or invite link.
      </p>
      <input
        id="roomName"
        name="roomName"
        type="text"
        placeholder="Room code or paste link (e.g. srad-c13n)"
        value={roomInput}
        onChange={(e) => setRoomInput(e.target.value)}
        required
        className={styles.input}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.65rem', alignItems: 'center' }}>
          <input
            id="use-e2ee-join"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
            style={{ accentColor: '#FF6352', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="use-e2ee-join" style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}>
            Room uses end-to-end encryption
          </label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="join-passphrase" style={{ fontSize: '0.825rem', color: 'rgba(255, 255, 255, 0.65)' }}>
              Passphrase
            </label>
            <input
              id="join-passphrase"
              type="password"
              placeholder="Room Passphrase"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
              className={styles.input}
            />
          </div>
        )}
      </div>

      <button className={styles.actionButton} type="submit" style={{ marginTop: '0.25rem' }}>
        Join Call
      </button>
    </form>
  );
}

export default function Page() {
  return (
    <div className={styles.pageWrapper}>
      {/* Interactive Pixel Snow Canvas in the Background */}
      <div className={styles.snowBackdrop}>
        <PixelSnow
          color="#ffffff"
          variant="snowflake"
          density={0.5}
          speed={1}
          wind={0.25}
          flakeSize={1}
          pixelSize={3}
          glow={0.8}
          mouseInteraction
          sway={0.5}
          twinkle={0.35}
          accumulate={false}
          depth={0.6}
          brightness={1}
          fade={0}
          opacity={1}
          intro
          lightMode={false}
        />
      </div>

      {/* Atmospheric center glow */}
      <div className={styles.ambientGlow} />

      <main className={styles.main} data-lk-theme="default">
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Real-Time AR Face Filters</span>
        </div>

        <div className={styles.header}>
          <img
            src="/images/snap-meet-home.svg"
            alt="Snap Meet"
            width="360"
            height="54"
            className={styles.logo}
          />
          <h2 className={styles.subtitle}>
            Real-time video calling with funny face filters and AR effects.
          </h2>
        </div>

        <Suspense fallback={<div style={{ color: 'rgba(255,255,255,0.6)' }}>Loading...</div>}>
          <Tabs>
            <StartCallTab label="Start Call" />
            <JoinCallTab label="Join Call" />
          </Tabs>
        </Suspense>

        <div className={styles.featureRow}>
          <span className={styles.featurePill}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Snap Camera Kit</span>
          </span>
          <span className={styles.featurePill}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Ultra-low Latency WebRTC</span>
          </span>
          <span className={styles.featurePill}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>E2EE Encrypted</span>
          </span>
        </div>
      </main>

      <footer className={styles.footer} data-lk-theme="default">
        Hosted on{' '}
        <a href="https://livekit.io/cloud?ref=meet" target="_blank" rel="noopener">
          LiveKit Cloud
        </a>
        . Source code on{' '}
        <a href="https://github.com/KunalGhadge/SnapMeet" target="_blank" rel="noopener">
          GitHub
        </a>
        .
      </footer>
    </div>
  );
}
