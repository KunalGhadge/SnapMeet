'use client';

import React, { useState, useEffect } from 'react';
import { FilterType } from './faceDeformationRenderer';

export type FilterTarget = 'me' | 'both' | 'all' | 'friend' | string;

export interface ParticipantOption {
  identity: string;
  name: string;
}

export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  intensity: number;
  onIntensityChange: (val: number) => void;
  target: FilterTarget;
  onTargetChange: (target: FilterTarget) => void;
  remoteParticipants?: ParticipantOption[];
}

interface LensDefinition {
  id: FilterType;
  name: string;
  category: 'ar' | 'warp' | 'party';
  hint: string;
  gradient: string;
  glowColor: string;
  badge?: string;
  icon: React.ReactNode;
}

const LENSES: LensDefinition[] = [
  // --- Clean Passthrough ---
  {
    id: 'none',
    name: 'Normal',
    category: 'warp',
    hint: 'Original natural camera, zero distortion',
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
    glowColor: 'rgba(255, 255, 255, 0.25)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="5" y1="5" x2="19" y2="19" />
      </svg>
    ),
  },

  // --- Snapchat AR Props ---
  {
    id: 'dog_face',
    name: 'Puppy Dog',
    category: 'ar',
    badge: 'Snapchat',
    hint: 'Classic Snapchat dog ears, snout & lick',
    gradient: 'linear-gradient(145deg, #f59e0b, #d97706 55%, #92400e)',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .107.94 1.5 2 3.5 2 1.932 0 4-1 4-2.828" fill="rgba(255,255,255,0.2)" />
        <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.107.94-1.5 2-3.5 2-1.932 0-4-1-4-2.828" fill="rgba(255,255,255,0.2)" />
        <circle cx="12" cy="14" r="5" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="12" cy="14.5" rx="1.6" ry="1.1" fill="#fff" />
        <path d="M11 16.5c0 1.4.5 2 1 2s1-.6 1-2" />
      </svg>
    ),
  },
  {
    id: 'cat_face',
    name: 'Cute Kitty',
    category: 'ar',
    badge: 'Popular',
    hint: 'Fluffy pink cat ears & sparkling whiskers',
    gradient: 'linear-gradient(145deg, #f472b6, #db2777 55%, #9d174d)',
    glowColor: 'rgba(236, 72, 153, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5.5c-4.4 0-7.5 2.8-7.5 6.5 0 2.2 1.1 4.1 3 5.4V20l3.5-1.5c.3.1.7.1 1 .1 4.4 0 7.5-2.8 7.5-6.5S16.4 5.5 12 5.5z" fill="rgba(255,255,255,0.15)" />
        <path d="M6.5 8.5 4.5 3.5l5 1.8" fill="rgba(255,255,255,0.3)" />
        <path d="M17.5 8.5 19.5 3.5l-5 1.8" fill="rgba(255,255,255,0.3)" />
        <circle cx="9.5" cy="11.5" r="1.2" fill="#fff" />
        <circle cx="14.5" cy="11.5" r="1.2" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'thug_life',
    name: 'Thug Life',
    category: 'ar',
    badge: 'Meme',
    hint: '8-Bit pixel sunglasses & burning cigar',
    gradient: 'linear-gradient(145deg, #3f3f46, #18181b 60%, #09090b)',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="9" width="8" height="5" rx="1" fill="#fff" />
        <rect x="14" y="9" width="8" height="5" rx="1" fill="#fff" />
        <line x1="10" y1="11" x2="14" y2="11" stroke="#fff" strokeWidth="2" />
        <line x1="2" y1="11" x2="0" y2="11" stroke="#fff" strokeWidth="2" />
        <line x1="22" y1="11" x2="24" y2="11" stroke="#fff" strokeWidth="2" />
        <circle cx="5" cy="11.5" r="1" fill="#10b981" />
        <circle cx="17" cy="11.5" r="1" fill="#10b981" />
      </svg>
    ),
  },
  {
    id: 'disguise',
    name: 'Disguise',
    category: 'ar',
    hint: 'Groucho Marx glasses, big nose & mustache',
    gradient: 'linear-gradient(145deg, #eab308, #ca8a04 55%, #713f12)',
    glowColor: 'rgba(234, 179, 8, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6.5" cy="8.5" r="3.2" stroke="#fff" />
        <circle cx="17.5" cy="8.5" r="3.2" stroke="#fff" />
        <line x1="9.7" y1="8.5" x2="14.3" y2="8.5" strokeWidth="2" />
        <ellipse cx="12" cy="12.5" rx="2" ry="2.5" fill="#fff" />
        <path d="M7 16c2-1 4 0 5 1 1-1 3-2 5-1 0 1-2 2-5 2s-5-1-5-2z" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'devil_horns',
    name: 'Neon Devil',
    category: 'ar',
    badge: 'Hot',
    hint: 'Glowing red cyber horns & fiery eyes',
    gradient: 'linear-gradient(145deg, #f43f5e, #be123c 55%, #4c0519)',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9C4 5 5 2 8 3c-1 3 0 5 1 7" fill="rgba(255,255,255,0.3)" />
        <path d="M19 9c1-4 0-7-3-6 1 3 0 5-1 7" fill="rgba(255,255,255,0.3)" />
        <circle cx="12" cy="14" r="5" stroke="#fff" />
        <circle cx="10" cy="13.5" r="1" fill="#fff" />
        <circle cx="14" cy="13.5" r="1" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'angel_halo',
    name: 'Angel Halo',
    category: 'ar',
    hint: 'Golden floating halo & heavenly sparkles',
    gradient: 'linear-gradient(145deg, #38bdf8, #0284c7 55%, #075985)',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" stroke="#fff" strokeWidth="2.2" fill="rgba(255,255,255,0.2)" />
        <circle cx="12" cy="15" r="4.5" stroke="#fff" />
        <path d="M19 11l1-1-1-1-1 1z" fill="#fff" />
        <path d="M5 11l1-1-1-1-1 1z" fill="#fff" />
      </svg>
    ),
  },

  // --- Crazy Face Warps ---
  {
    id: 'big_head',
    name: 'Big Head',
    category: 'warp',
    badge: 'Fun',
    hint: 'Comic balloon cranium magnification',
    gradient: 'linear-gradient(145deg, #fb923c, #ea580c 55%, #9a3412)',
    glowColor: 'rgba(251, 146, 60, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="7.5" fill="rgba(255,255,255,0.2)" />
        <circle cx="9.5" cy="8.5" r="1" fill="#fff" />
        <circle cx="14.5" cy="8.5" r="1" fill="#fff" />
        <path d="M9.5 12a3 3 0 0 0 5 0" />
        <path d="M12 17.5v3.5" />
      </svg>
    ),
  },
  {
    id: 'tiny_face',
    name: 'Tiny Face',
    category: 'warp',
    hint: 'Comical pinched micro-features',
    gradient: 'linear-gradient(145deg, #c084fc, #9333ea 55%, #581c87)',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="6" stroke="#fff" />
        <circle cx="12" cy="12" r="2.8" fill="#fff" />
        <circle cx="11.2" cy="11.2" r="0.5" fill="#581c87" />
        <circle cx="12.8" cy="11.2" r="0.5" fill="#581c87" />
      </svg>
    ),
  },
  {
    id: 'alien',
    name: 'Alien',
    category: 'warp',
    badge: 'Sci-Fi',
    hint: 'Extraterrestrial cranium & radioactive glow',
    gradient: 'linear-gradient(145deg, #4ade80, #16a34a 55%, #14532d)',
    glowColor: 'rgba(74, 222, 128, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6 2 2 6 2 11.5c0 4 3.5 8 10 10.5 6.5-2.5 10-6.5 10-10.5C22 6 18 2 12 2z" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="7.5" cy="11" rx="2.5" ry="1.6" fill="#fff" />
        <ellipse cx="16.5" cy="11" rx="2.5" ry="1.6" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'mega_chin',
    name: 'Mega Chin',
    category: 'warp',
    hint: 'Gigachad superhero titanium jawline',
    gradient: 'linear-gradient(145deg, #94a3b8, #475569 55%, #1e293b)',
    glowColor: 'rgba(148, 163, 184, 0.5)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h14v7c0 5-4.5 9.5-7 11-2.5-1.5-7-6-7-11V4z" fill="rgba(255,255,255,0.18)" />
        <path d="M9 13.5h6" />
        <path d="M10 16.5h4" />
      </svg>
    ),
  },
  {
    id: 'swirl',
    name: 'Vortex Swirl',
    category: 'warp',
    hint: 'Funhouse carnival whirlpool vortex',
    gradient: 'linear-gradient(145deg, #f43f5e, #a855f7 50%, #3b82f6)',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 6a6 6 0 1 0 6 6" />
        <path d="M12 9a3 3 0 1 0 3 3" />
      </svg>
    ),
  },
  {
    id: 'jelly',
    name: 'Jelly Wobble',
    category: 'warp',
    hint: 'Liquid gelatin wobbling funhouse ripple',
    gradient: 'linear-gradient(145deg, #22d3ee, #0891b2 55%, #164e63)',
    glowColor: 'rgba(34, 211, 238, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 4.5-3 5 0" />
        <path d="M2 7c2.5-3 5-3 7.5 0s5 3 7.5 0 4.5-3 5 0" />
        <path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 4.5-3 5 0" />
      </svg>
    ),
  },
  {
    id: 'cyclops',
    name: 'Cyclops',
    category: 'warp',
    hint: 'Giant centered mystic cyclops eye',
    gradient: 'linear-gradient(145deg, #818cf8, #4f46e5 55%, #312e81)',
    glowColor: 'rgba(129, 140, 248, 0.55)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="rgba(255,255,255,0.18)" />
        <circle cx="12" cy="12" r="3.2" stroke="#fff" />
        <circle cx="12" cy="12" r="1.5" fill="#fff" />
      </svg>
    ),
  },

  // --- Surprise Me (Party Mode) ---
  {
    id: 'random',
    name: 'Surprise Me',
    category: 'party',
    badge: 'Party',
    hint: 'Rolls a synchronized surprise effect!',
    gradient: 'conic-gradient(from 180deg at 50% 50%, #ec4899, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ec4899)',
    glowColor: 'rgba(236, 72, 153, 0.65)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(0,0,0,0.25)" />
        <circle cx="7.5" cy="7.5" r="1.5" fill="#fff" />
        <circle cx="16.5" cy="7.5" r="1.5" fill="#fff" />
        <circle cx="12" cy="12" r="1.5" fill="#fff" />
        <circle cx="7.5" cy="16.5" r="1.5" fill="#fff" />
        <circle cx="16.5" cy="16.5" r="1.5" fill="#fff" />
      </svg>
    ),
  },
];

export function FilterPanel({
  isOpen,
  onClose,
  activeFilter,
  onSelectFilter,
  intensity,
  onIntensityChange,
  target,
  onTargetChange,
  remoteParticipants = [],
}: FilterPanelProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ar' | 'warp'>('all');
  const [hoveredLens, setHoveredLens] = useState<LensDefinition | null>(null);

  // Dismiss on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const visibleLenses = LENSES.filter((item) => {
    if (item.id === 'none') return true;
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const activeDef = LENSES.find((l) => l.id === activeFilter);

  // Target label for clear feedback
  const getTargetSummary = () => {
    if (target === 'me') return { text: 'Yourself', icon: '🤳', type: 'self' };
    if (target === 'both' || target === 'all') return { text: 'Everyone in Call', icon: '👥', type: 'all' };
    const remote = remoteParticipants.find((p) => p.identity === target);
    return { text: remote?.name || 'Friend', icon: '🎯', type: 'friend' };
  };

  const targetSummary = getTargetSummary();

  const getIntensityLabel = (val: number) => {
    if (val <= 0.7) return 'Subtle';
    if (val <= 1.25) return 'Balanced';
    return 'Extreme 🔥';
  };

  return (
    <>
      {/* 1. Backdrop for clean outside click dismissal */}
      <div
        className="funny-filter-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. State-of-the-art AR Studio Drawer */}
      <div className="funny-lens-studio" role="dialog" aria-modal="true" aria-label="Snap Lenses & AR Effects">
        {/* Mobile drag handle */}
        <div className="funny-mobile-handle" />

        {/* 1. Studio Header */}
        <div className="funny-studio-header">
          <div className="funny-studio-title-group">
            <span className="funny-studio-sparkle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
            </span>
            <div>
              <div className="funny-studio-title">
                Snap Lenses & Effects
              </div>
              <div className="funny-studio-subtitle">
                {LENSES.length - 1} interactive real-time AR filters
              </div>
            </div>
          </div>

          <div className="funny-studio-actions">
            {/* Quick Roll Surprise */}
            <button
              type="button"
              className="funny-quick-dice-btn"
              onClick={() => onSelectFilter('random')}
              title="Surprise me with a random effect!"
            >
              <span>🎲</span>
              <span className="funny-quick-dice-text">Random</span>
            </button>

            {/* Quick Reset if Active */}
            {activeFilter !== 'none' && (
              <button
                type="button"
                className="funny-reset-chip"
                onClick={() => onSelectFilter('none')}
                title="Remove current active effect"
              >
                Clear
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              className="funny-studio-close-btn"
              onClick={onClose}
              aria-label="Close lenses menu"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="funny-studio-body">
          {/* 2. Apple/Discord Style Segmented Target Selector */}
          <div className="funny-target-section">
            <div className="funny-section-header">
              <span className="funny-section-label">APPLY LENS TO</span>
              <span className="funny-target-feedback">
                <span className="funny-target-dot" />
                <span>{targetSummary.icon} {targetSummary.text}</span>
              </span>
            </div>

            <div className="funny-target-picker">
              <button
                type="button"
                className={`funny-target-pill ${target === 'me' ? 'active' : ''}`}
                onClick={() => onTargetChange('me')}
              >
                <span className="funny-pill-icon">🤳</span>
                <span className="funny-pill-name">Myself</span>
              </button>

              <button
                type="button"
                className={`funny-target-pill ${target === 'both' || target === 'all' ? 'active' : ''}`}
                onClick={() => onTargetChange(remoteParticipants.length <= 1 ? 'both' : 'all')}
              >
                <span className="funny-pill-icon">👥</span>
                <span className="funny-pill-name">{remoteParticipants.length <= 1 ? 'Both' : 'Everyone'}</span>
              </button>

              {/* Duo call: 1 remote friend */}
              {remoteParticipants.length <= 1 && (
                <button
                  type="button"
                  className={`funny-target-pill ${
                    target === 'friend' ||
                    (remoteParticipants[0] && target === remoteParticipants[0].identity)
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    onTargetChange(remoteParticipants[0]?.identity || 'friend')
                  }
                >
                  <span className="funny-pill-icon">🎯</span>
                  <span className="funny-pill-name">{remoteParticipants[0]?.name || 'Friend'}</span>
                </button>
              )}

              {/* Group call: multiple remote friends */}
              {remoteParticipants.length > 1 &&
                remoteParticipants.map((p) => {
                  const isSelected = target === p.identity;
                  return (
                    <button
                      key={p.identity}
                      type="button"
                      className={`funny-target-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => onTargetChange(p.identity)}
                    >
                      <span className="funny-pill-icon">🎯</span>
                      <span className="funny-pill-name">{p.name || p.identity.slice(0, 8)}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* 3. Category Filter Tabs */}
          <div className="funny-category-bar">
            {(
              [
                { id: 'all', label: '✨ All Lenses' },
                { id: 'ar', label: '🎭 Snapchat AR' },
                { id: 'warp', label: '🌀 Face Warps' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`funny-category-tab ${activeCategory === tab.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4. Snapchat-Style Circular Lens Grid */}
          <div className="funny-lens-grid" role="listbox" aria-label="Available AR Lenses">
            {visibleLenses.map((lens) => {
              const isSelected = activeFilter === lens.id;
              return (
                <div
                  key={lens.id}
                  className="funny-lens-item"
                  onMouseEnter={() => setHoveredLens(lens)}
                  onMouseLeave={() => setHoveredLens(null)}
                >
                  <button
                    type="button"
                    className={`funny-lens-puck ${isSelected ? 'active' : ''}`}
                    style={
                      {
                        '--lens-gradient': lens.gradient,
                        '--lens-glow': lens.glowColor,
                      } as React.CSSProperties
                    }
                    onClick={() => onSelectFilter(lens.id)}
                    aria-label={`Select ${lens.name} filter`}
                    aria-selected={isSelected}
                  >
                    <div className="funny-lens-glow-effect" />
                    <div className="funny-lens-icon-wrap">
                      {lens.icon}
                    </div>

                    {/* Active Checkmark Badge */}
                    {isSelected && (
                      <div className="funny-lens-active-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}

                    {/* Fun category badge if popular or new */}
                    {lens.badge && !isSelected && (
                      <span className="funny-lens-pill-tag">
                        {lens.badge}
                      </span>
                    )}
                  </button>

                  <span className={`funny-lens-label ${isSelected ? 'active' : ''}`}>
                    {lens.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Sleek Bottom Studio Shelf: Active Lens Details & Real-Time Intensity */}
        <div className="funny-studio-footer">
          {activeFilter !== 'none' && activeDef ? (
            <div className="funny-active-shelf">
              <div className="funny-shelf-meta">
                <span className="funny-shelf-icon-puck" style={{ background: activeDef.gradient }}>
                  {activeDef.icon}
                </span>
                <div className="funny-shelf-text">
                  <div className="funny-shelf-name">
                    {activeDef.name}
                    <span className="funny-shelf-target-tag">
                      {targetSummary.text}
                    </span>
                  </div>
                  <div className="funny-shelf-hint">{activeDef.hint}</div>
                </div>
              </div>

              {/* Intensity Slider with Notch Marks */}
              <div className="funny-shelf-slider-group">
                <div className="funny-slider-header">
                  <span className="funny-slider-label">Warps & Props Scale</span>
                  <span className="funny-slider-val">{getIntensityLabel(intensity)}</span>
                </div>
                <div className="funny-slider-track-wrap">
                  <span className="funny-slider-min">Subtle</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.7"
                    step="0.05"
                    value={intensity}
                    onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
                    className="funny-intensity-range"
                    aria-label="Filter effect intensity"
                  />
                  <span className="funny-slider-max">Max 🔥</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="funny-shelf-idle">
              <span className="funny-idle-icon">✨</span>
              <span>
                {hoveredLens
                  ? hoveredLens.hint
                  : 'Tap any lens above to prank a friend or yourself in real-time!'}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
