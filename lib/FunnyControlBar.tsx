'use client';

import React from 'react';
import { Track } from 'livekit-client';
import {
  ChatToggle,
  DisconnectButton,
  MediaDeviceMenu,
  StartMediaButton,
  TrackToggle,
  useLocalParticipantPermissions,
  useMaybeLayoutContext,
  usePersistentUserChoices,
} from '@livekit/components-react';
export interface FunnyControlBarProps {
  activeFilter: string;
  filterLabel: string;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  showSettings: boolean;
}

export function FunnyControlBar({
  activeFilter,
  filterLabel,
  isPanelOpen,
  onTogglePanel,
  showSettings,
}: FunnyControlBarProps) {
  const layoutContext = useMaybeLayoutContext();
  const localPermissions = useLocalParticipantPermissions();

  const [isChatOpen, setIsChatOpen] = React.useState(false);
  React.useEffect(() => {
    if (layoutContext?.widget?.state?.showChat !== undefined) {
      setIsChatOpen(layoutContext.widget.state.showChat);
    }
  }, [layoutContext?.widget?.state?.showChat]);

  // Responsive: on half-screen or split windows, collapse to icon-only like native LiveKit Meet
  const [isNarrow, setIsNarrow] = React.useState(false);
  React.useEffect(() => {
    const checkWidth = () => {
      const threshold = isChatOpen ? 1000 : 760;
      setIsNarrow(window.innerWidth < threshold);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [isChatOpen]);

  const showText = !isNarrow;

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: false });

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled],
  );

  const cameraOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveVideoInputEnabled(enabled) : null,
    [saveVideoInputEnabled],
  );

  const isFilterActive = activeFilter !== 'none';

  return (
    <div className="lk-control-bar funny-control-bar">
      {/* 1. Microphone with Device Menu */}
      <div className="lk-button-group">
        <TrackToggle
          source={Track.Source.Microphone}
          showIcon={true}
          onChange={microphoneOnChange}
        >
          {showText && 'Microphone'}
        </TrackToggle>
        <div className="lk-button-group-menu">
          <MediaDeviceMenu
            kind="audioinput"
            onActiveDeviceChange={(_kind, deviceId) =>
              saveAudioInputDeviceId(deviceId ?? 'default')
            }
          />
        </div>
      </div>

      {/* 2. Camera with Device Menu */}
      <div className="lk-button-group">
        <TrackToggle
          source={Track.Source.Camera}
          showIcon={true}
          onChange={cameraOnChange}
        >
          {showText && 'Camera'}
        </TrackToggle>
        <div className="lk-button-group-menu">
          <MediaDeviceMenu
            kind="videoinput"
            onActiveDeviceChange={(_kind, deviceId) =>
              saveVideoInputDeviceId(deviceId ?? 'default')
            }
          />
        </div>
      </div>

      {/* 3. Screen Share */}
      <TrackToggle
        source={Track.Source.ScreenShare}
        captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
        showIcon={true}
      >
        {showText && 'Share screen'}
      </TrackToggle>

      {/* 4. Native Face Effects Button matching LiveKit design */}
      <button
        type="button"
        className="lk-button funny-effects-control-button"
        aria-pressed={isPanelOpen || isFilterActive}
        onClick={onTogglePanel}
        title="Apply funny face effects"
        style={{
          backgroundColor: isFilterActive ? 'var(--lk-accent-bg, #1f8cf9)' : isPanelOpen ? 'var(--lk-control-active-bg)' : undefined,
          color: isFilterActive ? '#fff' : undefined,
          boxShadow: isFilterActive ? '0 0 16px rgba(31, 140, 249, 0.45)' : undefined,
          transition: 'all 0.16s ease',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isFilterActive ? '#fff' : 'currentColor'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636" />
        </svg>
        {showText && <span>{isFilterActive ? filterLabel : 'Effects'}</span>}
        {isFilterActive && (
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 6px #38bdf8',
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {/* 5. Chat */}
      <ChatToggle>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {showText && 'Chat'}
      </ChatToggle>

      {/* 6. Settings Menu */}
      {showSettings && (
        <button
          type="button"
          className="lk-button lk-settings-toggle"
          aria-pressed={layoutContext?.widget?.state?.showSettings}
          onClick={() => {
            layoutContext?.widget?.dispatch?.({ msg: 'toggle_settings' });
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {showText && 'Settings'}
        </button>
      )}

      {/* 7. Leave Call */}
      <DisconnectButton>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {showText && 'Leave'}
      </DisconnectButton>

      <StartMediaButton />
    </div>
  );
}
