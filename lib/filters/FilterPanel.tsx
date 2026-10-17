'use client';

import React, { useState, useEffect } from 'react';
import {
  loadConfiguredSnapLenses,
  isCameraKitConfigured,
  formatLensDisplayName,
  Lens,
} from '../camerakit/cameraKitService';

export type FilterTarget = 'me' | 'both' | 'all' | 'friend' | string;

export interface ParticipantOption {
  identity: string;
  name: string;
}

export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  intensity?: number;
  onIntensityChange?: (val: number) => void;
  target: FilterTarget;
  onTargetChange: (target: FilterTarget) => void;
  remoteParticipants?: ParticipantOption[];
}

// Preset visual themes for lenses with gradient backdrops and curated AR glyphs
const LENS_THEMES = [
  {
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    glyph: (
      // Face Mesh AR glyph
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3a3 3 0 0 1 6 0" />
        <path d="M4 10c0 5 3.5 9 8 9s8-4 8-9c0-3.5-2-6-4.5-7.5" />
        <circle cx="9" cy="10" r="1.5" fill="#fff" />
        <circle cx="15" cy="10" r="1.5" fill="#fff" />
        <path d="M10 14.5a3 3 0 0 0 4 0" />
        <line x1="12" y1="10" x2="12" y2="12.5" />
      </svg>
    ),
  },
  {
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    glyph: (
      // Cyber Sparkle / Lens glyph
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    glyph: (
      // Visor / Optics glyph
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="9" rx="4.5" />
        <line x1="8" y1="7" x2="8" y2="16" />
        <line x1="16" y1="7" x2="16" y2="16" />
        <circle cx="5" cy="11.5" r="1.5" fill="#fff" />
        <circle cx="19" cy="11.5" r="1.5" fill="#fff" />
      </svg>
    ),
  },
  {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    glyph: (
      // Radiance / Studio Light glyph
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    glyph: (
      // Magic Wand / Effect glyph
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4V2m0 16v-2M8 9h2m10 0h-2m-2.2-5.8L14.4 4.6m-4.8 4.8L8.2 10.8M4 20l10-10" />
      </svg>
    ),
  },
  {
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    glyph: (
      // Hologram / 3D Box glyph
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

export function FilterPanel({
  isOpen,
  onClose,
  activeFilter = 'none',
  onSelectFilter,
  target,
  onTargetChange,
  remoteParticipants = [],
}: FilterPanelProps) {
  const [snapLenses, setSnapLenses] = useState<Lens[]>([]);
  const [isLoadingLenses, setIsLoadingLenses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load official Snap Lenses from the configured Lens Group on mount
  useEffect(() => {
    let isCancelled = false;

    if (!isCameraKitConfigured()) {
      setIsLoadingLenses(false);
      setLoadError('Camera Kit credentials missing in environment.');
      return;
    }

    setIsLoadingLenses(true);
    setLoadError(null);

    loadConfiguredSnapLenses()
      .then((lenses) => {
        if (!isCancelled) {
          setSnapLenses(lenses);
          setIsLoadingLenses(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('[FilterPanel] Failed to load Snap Lenses:', err);
          setLoadError(err?.message || 'Failed to load lenses from Snap Group');
          setIsLoadingLenses(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Keyboard accessibility: ESC key closes panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Resolve target description with clean vector icons (No Emojis)
  const targetSummary = (() => {
    if (target === 'me') {
      return {
        text: 'Your Video Preview',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ),
      };
    }
    if (target === 'both' || target === 'all') {
      return {
        text: remoteParticipants.length <= 1 ? 'Both Callers' : 'All Callers',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      };
    }
    const found = remoteParticipants.find((p) => p.identity === target);
    return {
      text: `${found?.name || 'Friend'}'s Video`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    };
  })();

  const isNoneActive = !activeFilter || activeFilter === 'none';

  return (
    <>
      {/* 1. Backdrop overlay */}
      <div
        className="funny-filter-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Official Snap Camera Kit Studio Drawer */}
      <div
        className="funny-lens-studio"
        role="dialog"
        aria-modal="true"
        aria-label="Snap Lenses & AR Effects"
      >
        {/* Mobile drag handle */}
        <div className="funny-mobile-handle" />

        {/* 1. Studio Header */}
        <div className="funny-studio-header">
          <div className="funny-studio-title-group">
            <span
              className="funny-studio-sparkle"
              style={{
                background: 'linear-gradient(135deg, #FFFC00 0%, #FF6352 100%)',
                color: '#0a0a0c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Snap Lens Icon (Clean Vector) */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
              </svg>
            </span>
            <div>
              <div className="funny-studio-title">
                Snap AR Lenses
              </div>
              <div className="funny-studio-subtitle">
                {isLoadingLenses
                  ? 'Loading Snap AR Lenses...'
                  : `${snapLenses.length} verified AR Lenses available`}
              </div>
            </div>
          </div>

          <div className="funny-studio-actions">
            {/* Quick Reset if Active */}
            {!isNoneActive && (
              <button
                type="button"
                className="funny-reset-chip"
                onClick={() => onSelectFilter('none')}
                title="Remove current active effect"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>Reset</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              className="funny-studio-close-btn"
              onClick={onClose}
              aria-label="Close lenses menu"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="funny-studio-body">
          {/* Target Selector: Apply to Friend / Myself / Everyone (Clean SVGs, No Emojis) */}
          <div className="funny-target-section">
            <div className="funny-section-header">
              <span className="funny-section-label">APPLY LENS TO</span>
              <span className="funny-target-feedback">
                <span className="funny-target-dot" />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {targetSummary.icon}
                  <span>{targetSummary.text}</span>
                </span>
              </span>
            </div>

            <div className="funny-target-picker">
              {/* Remote Friend(s) */}
              {remoteParticipants.length <= 1 ? (
                <button
                  type="button"
                  className={`funny-target-pill ${
                    target !== 'me' && target !== 'both' && target !== 'all' ? 'active' : ''
                  }`}
                  onClick={() =>
                    onTargetChange(remoteParticipants[0]?.identity || 'friend')
                  }
                >
                  <span className="funny-pill-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="funny-pill-name">
                    {remoteParticipants[0]?.name || 'Friend'}
                  </span>
                </button>
              ) : (
                remoteParticipants.map((p) => (
                  <button
                    key={p.identity}
                    type="button"
                    className={`funny-target-pill ${target === p.identity ? 'active' : ''}`}
                    onClick={() => onTargetChange(p.identity)}
                  >
                    <span className="funny-pill-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <span className="funny-pill-name">{p.name || p.identity}</span>
                  </button>
                ))
              )}

              {/* Everyone */}
              <button
                type="button"
                className={`funny-target-pill ${
                  target === 'both' || target === 'all' ? 'active' : ''
                }`}
                onClick={() =>
                  onTargetChange(remoteParticipants.length <= 1 ? 'both' : 'all')
                }
              >
                <span className="funny-pill-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <span className="funny-pill-name">
                  {remoteParticipants.length <= 1 ? 'Both' : 'Everyone'}
                </span>
              </button>

              {/* Local Video Preview */}
              <button
                type="button"
                className={`funny-target-pill ${target === 'me' ? 'active' : ''}`}
                onClick={() => onTargetChange('me')}
              >
                <span className="funny-pill-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </span>
                <span className="funny-pill-name">Myself</span>
              </button>
            </div>
          </div>

          {/* Lenses Tray */}
          <div>
            <div
              className="funny-section-label"
              style={{ marginBottom: '12px' }}
            >
              AVAILABLE LENSES ({snapLenses.length + 1})
            </div>

            {isLoadingLenses ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 16px',
                  gap: '14px',
                  color: 'rgba(255, 255, 255, 0.65)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255, 255, 255, 0.15)',
                    borderTopColor: '#FF6352',
                    animation: 'funnySpin 0.8s linear infinite',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                  Connecting to Snap Camera Kit...
                </span>
              </div>
            ) : loadError && snapLenses.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '14px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '13px',
                }}
              >
                <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#f87171' }}>
                  Unable to connect to Snap Lens Group
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {loadError}
                </p>
              </div>
            ) : (
              <div className="funny-lens-grid">
                {/* 1. Normal / Raw WebRTC Passthrough (Minimalist Camera Aperture) */}
                <div className="funny-lens-item">
                  <button
                    type="button"
                    className={`funny-lens-puck ${isNoneActive ? 'active' : ''}`}
                    onClick={() => onSelectFilter('none')}
                    aria-pressed={isNoneActive}
                    aria-label="Normal: Original camera with zero effects"
                    title="Normal original camera"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.14) 0%, rgba(20, 24, 34, 0.9) 100%)',
                      border: isNoneActive ? '2.5px solid #FFFC00' : '2px solid rgba(255, 255, 255, 0.16)',
                    }}
                  >
                    <div className="funny-lens-icon-wrap">
                      {/* Clean camera aperture / off icon */}
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4" y1="4" x2="20" y2="20" />
                      </svg>
                    </div>

                    {isNoneActive && (
                      <div className="funny-lens-active-badge">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <div className="funny-lens-name">Normal</div>
                </div>

                {/* 2. Official Snap Lenses from the Loaded Group */}
                {snapLenses.map((lens, index) => {
                  const isSelected = activeFilter === lens.id;
                  const theme = LENS_THEMES[index % LENS_THEMES.length];

                  return (
                    <div key={lens.id} className="funny-lens-item">
                      <button
                        type="button"
                        className={`funny-lens-puck ${isSelected ? 'active' : ''}`}
                        onClick={() => onSelectFilter(lens.id)}
                        aria-pressed={isSelected}
                        aria-label={`Apply Snap Lens: ${lens.name}`}
                        title={lens.name}
                        style={{
                          background: lens.iconUrl ? '#12141c' : theme.gradient,
                          border: isSelected ? '2.5px solid #FFFC00' : '2px solid rgba(255, 255, 255, 0.18)',
                          boxShadow: isSelected
                            ? '0 0 0 3px rgba(255, 252, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.6)'
                            : '0 4px 14px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        {lens.iconUrl ? (
                          <img
                            src={lens.iconUrl}
                            alt={lens.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div className="funny-lens-icon-wrap">
                            {theme.glyph}
                          </div>
                        )}

                        {isSelected && (
                          <div
                            className="funny-lens-active-badge"
                            style={{
                              backgroundColor: '#FFFC00',
                              color: '#000',
                            }}
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#000"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>

                      <div
                        className="funny-lens-name"
                        title={formatLensDisplayName(lens.name)}
                        style={{
                          maxWidth: '82px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '11px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#FFFC00' : 'rgba(255, 255, 255, 0.85)',
                        }}
                      >
                        {formatLensDisplayName(lens.name)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
