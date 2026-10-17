'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Chat,
  ConnectionStateToast,
  ConnectionQualityIndicator,
  LayoutContextProvider,
  ParticipantName,
  ParticipantTile,
  RoomAudioRenderer,
  TrackLoop,
  TrackMutedIndicator,
  useCreateLayoutContext,
  useEnsureTrackRef,
  useGridLayout,
  useRemoteParticipants,
  useRoomContext,
  useTracks,
  isTrackReference,
  TrackReferenceOrPlaceholder,
  WidgetState,
} from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';
import { FilterType } from './filters/faceDeformationRenderer';
import { FilterPanel, FilterTarget } from './filters/FilterPanel';
import { RemoteFunnyVideoTile } from './filters/RemoteFunnyVideoTile';
import { FunnyControlBar } from './FunnyControlBar';

export interface FunnyVideoConferenceProps {
  chatMessageFormatter?: any;
  chatMessageDecoder?: any;
  chatMessageEncoder?: any;
  SettingsComponent?: React.ComponentType;
}

const FILTER_LABELS: Record<FilterType, string> = {
  none: 'None',
  dog_face: 'Puppy Dog',
  cat_face: 'Cute Kitty',
  thug_life: 'Thug Life',
  disguise: 'Comedy Disguise',
  devil_horns: 'Neon Devil',
  angel_halo: 'Angel Halo',
  big_head: 'Big Head',
  tiny_face: 'Tiny Face',
  alien: 'Alien Cranium',
  mega_chin: 'Mega Chin',
  swirl: 'Carnival Swirl',
  jelly: 'Jelly Wobble',
  cyclops: 'Cyclops',
  random: 'Random Surprise',
};

const FILTER_ICONS: Record<FilterType, string> = {
  none: '🚫',
  dog_face: '🐶',
  cat_face: '🐱',
  thug_life: '🕶️',
  disguise: '🥸',
  devil_horns: '😈',
  angel_halo: '😇',
  big_head: '🎈',
  tiny_face: '🤏',
  alien: '👽',
  mega_chin: '🗿',
  swirl: '🌀',
  jelly: '🍮',
  cyclops: '👁️',
  random: '🎲',
};

const RANDOM_POOL: FilterType[] = [
  'dog_face',
  'cat_face',
  'thug_life',
  'disguise',
  'devil_horns',
  'angel_halo',
  'big_head',
  'tiny_face',
  'alien',
  'mega_chin',
  'swirl',
  'jelly',
];

interface IncomingToast {
  id: number;
  message: string;
  icon: string;
}

interface FunnyGridLayoutProps {
  tracks: TrackReferenceOrPlaceholder[];
  children: React.ReactNode;
}

function FunnyGridLayout({ tracks, children }: FunnyGridLayoutProps) {
  const gridElement = useRef<HTMLDivElement>(null);
  const { layout } = useGridLayout(gridElement, tracks.length);

  return (
    <div
      ref={gridElement}
      className="lk-grid-layout"
      style={
        {
          '--lk-col-count': layout?.columns ?? 1,
          '--lk-row-count': layout?.rows ?? 1,
        } as React.CSSProperties
      }
    >
      <TrackLoop tracks={tracks}>{children}</TrackLoop>
    </div>
  );
}

function FunnyParticipantTile({
  filtersByParticipant,
  defaultIntensity,
  onOpenFilterPanelForParticipant,
}: {
  filtersByParticipant: Record<string, { filter: FilterType; intensity: number }>;
  defaultIntensity: number;
  onOpenFilterPanelForParticipant: (identity: string) => void;
}) {
  const trackRef = useEnsureTrackRef();
  const isCamera = isTrackReference(trackRef) && trackRef.source === Track.Source.Camera;

  if (isCamera) {
    const identity = trackRef.participant.identity;
    const filterData = filtersByParticipant[identity];
    const tileFilter = filterData?.filter || 'none';
    const tileIntensity = filterData?.intensity ?? defaultIntensity;

    return (
      <ParticipantTile trackRef={trackRef}>
        <RemoteFunnyVideoTile
          trackRef={trackRef}
          activeFilter={tileFilter}
          filterIntensity={tileIntensity}
        />
        <div className="lk-participant-metadata">
          <div className="lk-participant-metadata-item">
            <TrackMutedIndicator
              trackRef={{
                participant: trackRef.participant,
                source: Track.Source.Microphone,
              }}
            />
            <ParticipantName />
          </div>

          {/* First-class native-styled effect badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFilterPanelForParticipant(identity);
            }}
            title={`Configure face effects for ${trackRef.participant.name || (trackRef.participant.isLocal ? 'myself' : 'friend')}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              backgroundColor: tileFilter !== 'none' ? 'var(--lk-accent-bg, #1f8cf9)' : 'var(--lk-control-bg, rgba(0, 0, 0, 0.55))',
              border: tileFilter !== 'none' ? '1px solid var(--lk-accent-bg, #1f8cf9)' : '1px solid var(--lk-border-color, rgba(255, 255, 255, 0.18))',
              borderRadius: 'var(--lk-border-radius, 6px)',
              padding: '2px 8px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              pointerEvents: 'auto',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{FILTER_ICONS[tileFilter]}</span>
            <span>{tileFilter === 'none' ? 'Effects' : FILTER_LABELS[tileFilter]}</span>
          </button>

          <ConnectionQualityIndicator className="lk-participant-metadata-item" />
        </div>
      </ParticipantTile>
    );
  }

  // Normal Participant Tile for screen shares
  return <ParticipantTile trackRef={trackRef} />;
}

export function FunnyVideoConference({
  chatMessageFormatter,
  chatMessageDecoder,
  chatMessageEncoder,
  SettingsComponent,
  ...htmlProps
}: FunnyVideoConferenceProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });

  const room = useRoomContext();
  const remoteParticipants = useRemoteParticipants();

  const remoteParticipantOptions = React.useMemo(() => {
    return remoteParticipants.map((p) => ({
      identity: p.identity,
      name: p.name || p.identity,
    }));
  }, [remoteParticipants]);

  // Per-participant filter states: identity -> { filter, intensity }
  const [filtersByParticipant, setFiltersByParticipant] = useState<
    Record<string, { filter: FilterType; intensity: number }>
  >({});
  const [filterIntensity, setFilterIntensity] = useState<number>(1.0);
  const [target, setTarget] = useState<FilterTarget>('friend');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Auto-align target with available remote participant if in standard 2-person call
  useEffect(() => {
    if (target === 'friend' && remoteParticipants.length === 1) {
      setTarget(remoteParticipants[0].identity);
    } else if (remoteParticipants.length === 0 && target !== 'me') {
      setTarget('me');
    }
  }, [remoteParticipants, target]);

  // Incoming notification toast when someone applies an effect
  const [toast, setToast] = useState<IncomingToast | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, icon: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ id: Date.now(), message, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const layoutContext = useCreateLayoutContext();

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  // Clean deduplicated tracks to eliminate ghost tiles and prevent placeholder collision errors
  const cleanTracks = React.useMemo(() => {
    const publishedKeys = new Set<string>();
    for (const t of tracks) {
      if (isTrackReference(t) && t.publication) {
        publishedKeys.add(`${t.participant.identity}_${t.source}`);
      }
    }

    const seenPlaceholders = new Set<string>();
    return tracks.filter((t) => {
      const isPub = isTrackReference(t) && t.publication;
      const key = `${t.participant.identity}_${t.source}`;
      if (!isPub) {
        if (publishedKeys.has(key)) return false;
        if (seenPlaceholders.has(key)) return false;
        seenPlaceholders.add(key);
        return true;
      }
      return true;
    });
  }, [tracks]);

  // Broadcast filter updates over LiveKit reliable WebRTC data channel
  const broadcastFilter = useCallback(
    (
      newFilter: FilterType,
      newIntensity: number,
      targetKey: FilterTarget,
      isRandomRoll: boolean = false,
    ) => {
      if (!room || !room.localParticipant) return;

      try {
        let targetIdentity: string = targetKey;
        if (targetKey === 'me') {
          targetIdentity = room.localParticipant.identity;
        } else if (targetKey === 'friend') {
          targetIdentity = remoteParticipants[0]?.identity || 'friend';
        } else if (targetKey === 'both') {
          targetIdentity = 'all';
        }

        const payload = {
          type: 'SNAP_MEET_FILTER_SYNC',
          filter: newFilter,
          intensity: newIntensity,
          targetIdentity,
          target: targetKey, // legacy fallback
          isRandomRoll,
          senderIdentity: room.localParticipant.identity,
          senderName: room.localParticipant.name || room.localParticipant.identity || 'Your friend',
        };
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(payload));
        room.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.warn('Failed to broadcast filter data:', err);
      }
    },
    [room, remoteParticipants],
  );

  // Listen for incoming filter sync from participants in the room
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        const data = JSON.parse(text);

        if (data?.type === 'SNAP_MEET_FILTER_SYNC') {
          const incomingFilter = data.filter as FilterType;
          const validFilter: FilterType = incomingFilter in FILTER_LABELS ? incomingFilter : 'none';
          const incomingIntensity: number = typeof data.intensity === 'number' ? data.intensity : 1.0;
          const isRandomRoll = Boolean(data.isRandomRoll);
          const senderName: string = data.senderName || 'Your friend';
          const senderIdentity: string = data.senderIdentity;

          let targetIdentity: string = data.targetIdentity;
          if (!targetIdentity) {
            if (data.target === 'friend') targetIdentity = room.localParticipant.identity;
            else if (data.target === 'me') targetIdentity = senderIdentity;
            else if (data.target === 'both') targetIdentity = 'all';
          }

          const actionLabel = isRandomRoll
            ? `rolled Random: ${FILTER_LABELS[validFilter]}`
            : `applied ${FILTER_LABELS[validFilter]}`;

          if (targetIdentity === 'all' || targetIdentity === 'both') {
            // Apply to all callers
            setFiltersByParticipant((prev) => {
              const next = { ...prev };
              if (room.localParticipant) {
                next[room.localParticipant.identity] = {
                  filter: validFilter,
                  intensity: incomingIntensity,
                };
              }
              remoteParticipants.forEach((p) => {
                next[p.identity] = {
                  filter: validFilter,
                  intensity: incomingIntensity,
                };
              });
              return next;
            });

            if (validFilter !== 'none') {
              showToast(`${senderName} ${actionLabel} to everyone!`, FILTER_ICONS[validFilter]);
            } else {
              showToast(`${senderName} reset all face filters`, '✨');
            }
          } else if (targetIdentity === room.localParticipant.identity) {
            // Target is ME!
            setFiltersByParticipant((prev) => ({
              ...prev,
              [room.localParticipant.identity]: {
                filter: validFilter,
                intensity: incomingIntensity,
              },
            }));

            if (validFilter !== 'none') {
              showToast(`${senderName} ${actionLabel} to you!`, FILTER_ICONS[validFilter]);
            } else {
              showToast(`${senderName} reset your face filter`, '✨');
            }
          } else {
            // Target is a specific participant in the room
            setFiltersByParticipant((prev) => ({
              ...prev,
              [targetIdentity]: {
                filter: validFilter,
                intensity: incomingIntensity,
              },
            }));

            if (targetIdentity === senderIdentity && validFilter !== 'none') {
              showToast(`${senderName} applied ${FILTER_LABELS[validFilter]} to themselves!`, FILTER_ICONS[validFilter]);
            }
          }
        }
      } catch (e) {
        // Non-filter JSON or binary packet
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, remoteParticipants, showToast]);

  // Handler when user selects a filter in the FilterPanel
  const handleSelectFilter = useCallback(
    (requestedFilter: FilterType) => {
      let resolvedFilter = requestedFilter;
      let isRandomRoll = false;

      // Deterministically pick a single random filter so all participants see the exact same result
      if (requestedFilter === 'random') {
        const currentActiveFilter =
          target === 'me' && room?.localParticipant
            ? filtersByParticipant[room.localParticipant.identity]?.filter || 'none'
            : target === 'all' || target === 'both'
            ? 'none'
            : filtersByParticipant[target]?.filter || 'none';

        const availablePool = RANDOM_POOL.filter((f) => f !== currentActiveFilter);
        resolvedFilter = availablePool[Math.floor(Math.random() * availablePool.length)];
        isRandomRoll = true;
      }

      setFiltersByParticipant((prev) => {
        const next = { ...prev };
        if (target === 'me') {
          if (room?.localParticipant) {
            next[room.localParticipant.identity] = {
              filter: resolvedFilter,
              intensity: filterIntensity,
            };
          }
        } else if (target === 'all' || target === 'both') {
          if (room?.localParticipant) {
            next[room.localParticipant.identity] = {
              filter: resolvedFilter,
              intensity: filterIntensity,
            };
          }
          remoteParticipants.forEach((p) => {
            next[p.identity] = {
              filter: resolvedFilter,
              intensity: filterIntensity,
            };
          });
        } else {
          const resolvedTargetId =
            target === 'friend' && remoteParticipants[0]
              ? remoteParticipants[0].identity
              : target;
          next[resolvedTargetId] = {
            filter: resolvedFilter,
            intensity: filterIntensity,
          };
        }
        return next;
      });

      broadcastFilter(resolvedFilter, filterIntensity, target, isRandomRoll);
    },
    [target, filterIntensity, filtersByParticipant, room, remoteParticipants, broadcastFilter],
  );

  // Handler when user adjusts the intensity slider
  const handleIntensityChange = useCallback(
    (newIntensity: number) => {
      setFilterIntensity(newIntensity);

      let currentActive: FilterType = 'none';
      if (target === 'me' && room?.localParticipant) {
        currentActive = filtersByParticipant[room.localParticipant.identity]?.filter || 'none';
      } else if (target === 'all' || target === 'both') {
        currentActive =
          (room?.localParticipant && filtersByParticipant[room.localParticipant.identity]?.filter) ||
          'none';
      } else {
        const resolvedTargetId =
          target === 'friend' && remoteParticipants[0]
            ? remoteParticipants[0].identity
            : target;
        currentActive = filtersByParticipant[resolvedTargetId]?.filter || 'none';
      }

      if (currentActive !== 'none') {
        broadcastFilter(currentActive, newIntensity, target);
      }
    },
    [target, filtersByParticipant, room, remoteParticipants, broadcastFilter],
  );

  // Active filter for the FilterPanel preview/reset state
  const currentPanelFilter: FilterType =
    target === 'me' && room?.localParticipant
      ? filtersByParticipant[room.localParticipant.identity]?.filter || 'none'
      : target === 'all' || target === 'both'
      ? 'none'
      : filtersByParticipant[target === 'friend' ? (remoteParticipants[0]?.identity || '') : target]?.filter || 'none';

  // Active filter for the bottom control bar label
  const activeControlFilter: FilterType =
    (room?.localParticipant && filtersByParticipant[room.localParticipant.identity]?.filter) ||
    currentPanelFilter;

  return (
    <div className="lk-video-conference funny-video-conference" style={{ position: 'relative' }} {...htmlProps}>
      {/* 1. Ensure remote audio plays seamlessly */}
      <RoomAudioRenderer />

      {/* 2. Connection State Toast */}
      <ConnectionStateToast />

      {/* 3. Incoming Filter Toast (When Friend applies a filter to you) */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'min(92vw, 440px)',
            boxSizing: 'border-box',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            borderRadius: '999px',
            backgroundColor: 'rgba(24, 28, 36, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--lk-accent-bg, #1f8cf9)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 16px rgba(31, 140, 249, 0.3)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            animation: 'funnyFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0 }}>{toast.icon}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{toast.message}</span>
        </div>
      )}

      <LayoutContextProvider value={layoutContext} onWidgetChange={setWidgetState}>
        <div className="lk-video-conference-inner">
          <div className="lk-grid-layout-wrapper">
            <FunnyGridLayout tracks={cleanTracks}>
              <FunnyParticipantTile
                filtersByParticipant={filtersByParticipant}
                defaultIntensity={filterIntensity}
                onOpenFilterPanelForParticipant={(identity) => {
                  setTarget(identity);
                  setShowFilterPanel(true);
                }}
              />
            </FunnyGridLayout>
          </div>

          {/* 4. Professional Filter Drawer / Popover */}
          <FilterPanel
            isOpen={showFilterPanel}
            onClose={() => setShowFilterPanel(false)}
            activeFilter={currentPanelFilter}
            onSelectFilter={handleSelectFilter}
            intensity={filterIntensity}
            onIntensityChange={handleIntensityChange}
            target={target}
            onTargetChange={setTarget}
            remoteParticipants={remoteParticipantOptions}
          />

          {/* 5. Native LiveKit Controls with Face Effects integrated directly */}
          <FunnyControlBar
            activeFilter={activeControlFilter}
            filterLabel={FILTER_LABELS[activeControlFilter]}
            isPanelOpen={showFilterPanel}
            onTogglePanel={() => setShowFilterPanel(!showFilterPanel)}
            showSettings={!!SettingsComponent}
          />
        </div>

        {/* 6. Chat */}
        <Chat
          style={{ display: widgetState.showChat ? 'grid' : 'none' }}
          messageFormatter={chatMessageFormatter}
          messageEncoder={chatMessageEncoder}
          messageDecoder={chatMessageDecoder}
        />

        {/* 7. Settings Modal */}
        {SettingsComponent && (
          <div
            className="lk-settings-menu-modal"
            style={{ display: widgetState.showSettings ? 'block' : 'none' }}
          >
            <SettingsComponent />
          </div>
        )}
      </LayoutContextProvider>
    </div>
  );
}
