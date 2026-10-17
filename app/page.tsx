'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

function Tabs(props: React.PropsWithChildren<{}>) {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get('tab') === 'join' ? 1 : 0;

  const router = useRouter();
  function onTabSelected(index: number) {
    const tab = index === 1 ? 'join' : 'start';
    router.push(`/?tab=${tab}`);
  }

  let tabs = React.Children.map(props.children, (child, index) => {
    return (
      <button
        type="button"
        className="lk-button"
        onClick={() => {
          if (onTabSelected) {
            onTabSelected(index);
          }
        }}
        aria-pressed={tabIndex === index}
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
      <p style={{ margin: 0 }}>Start an instant video call with real-time AR face filters.</p>
      <button style={{ marginTop: '0.5rem' }} className="lk-button" onClick={startMeeting} type="button">
        Start New Call
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', alignItems: 'center' }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
          />
          <label htmlFor="use-e2ee" style={{ fontSize: '14px', cursor: 'pointer' }}>
            Enable end-to-end encryption
          </label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
            <label htmlFor="passphrase" style={{ fontSize: '14px' }}>Passphrase</label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
              className="lk-form-control"
              style={{
                flex: 1,
                padding: '0.4rem 0.75rem',
                backgroundColor: 'var(--lk-control-bg, rgba(255, 255, 255, 0.05))',
                border: '1px solid var(--lk-border-color, rgba(255, 255, 255, 0.15))',
                borderRadius: 'var(--lk-border-radius, 6px)',
                color: 'inherit',
              }}
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
      <p style={{ margin: 0 }}>Join an existing call by entering a room code or invite link.</p>
      <input
        id="roomName"
        name="roomName"
        type="text"
        placeholder="Room code or paste link (e.g. srad-c13n)"
        value={roomInput}
        onChange={(e) => setRoomInput(e.target.value)}
        required
        className="lk-form-control"
        style={{
          width: '100%',
          backgroundColor: 'var(--lk-control-bg, rgba(255, 255, 255, 0.05))',
          color: 'inherit',
          border: '1px solid var(--lk-border-color, rgba(255, 255, 255, 0.15))',
          borderRadius: 'var(--lk-border-radius, 8px)',
          padding: '0.625rem 1rem',
          fontSize: 'inherit',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', alignItems: 'center' }}>
          <input
            id="use-e2ee-join"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
          />
          <label htmlFor="use-e2ee-join" style={{ fontSize: '14px', cursor: 'pointer' }}>
            Room uses end-to-end encryption
          </label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
            <label htmlFor="join-passphrase" style={{ fontSize: '14px' }}>Passphrase</label>
            <input
              id="join-passphrase"
              type="password"
              placeholder="Room Passphrase"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
              className="lk-form-control"
              style={{
                flex: 1,
                padding: '0.4rem 0.75rem',
                backgroundColor: 'var(--lk-control-bg, rgba(255, 255, 255, 0.05))',
                border: '1px solid var(--lk-border-color, rgba(255, 255, 255, 0.15))',
                borderRadius: 'var(--lk-border-radius, 6px)',
                color: 'inherit',
              }}
            />
          </div>
        )}
      </div>

      <button style={{ marginTop: '0.25rem', width: '100%' }} className="lk-button" type="submit">
        Join Call
      </button>
    </form>
  );
}

export default function Page() {
  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <div className="header">
          <img src="/images/snap-meet-home.svg" alt="Snap Meet" width="360" height="54" />
          <h2>
            Real-time video calling with funny face filters and AR effects.
          </h2>
        </div>
        <Suspense fallback="Loading">
          <Tabs>
            <StartCallTab label="Start Call" />
            <JoinCallTab label="Join Call" />
          </Tabs>
        </Suspense>
      </main>
      <footer data-lk-theme="default">
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
    </>
  );
}
