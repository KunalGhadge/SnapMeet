'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TrackReference, VideoTrack } from '@livekit/components-react';
import { FaceDeformationRenderer, FilterType, FaceCoordinates } from './faceDeformationRenderer';
import { FaceTracker } from './faceTracker';
import { ARFaceOverlay } from './ARFaceOverlay';

interface RemoteFunnyVideoTileProps {
  trackRef: TrackReference;
  activeFilter?: FilterType;
  filterIntensity?: number;
  onFilterChange?: (filter: FilterType) => void;
}

const AR_FILTERS: FilterType[] = [
  'dog_face',
  'cat_face',
  'thug_life',
  'disguise',
  'devil_horns',
  'angel_halo',
];

const WARP_FILTERS: FilterType[] = [
  'big_head',
  'tiny_face',
  'alien',
  'mega_chin',
  'swirl',
  'jelly',
  'cyclops',
  'random',
];

export function RemoteFunnyVideoTile({
  trackRef,
  activeFilter = 'none',
  filterIntensity = 1.0,
}: RemoteFunnyVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<FaceDeformationRenderer | null>(null);
  const trackerRef = useRef<FaceTracker | null>(null);
  const latestFaceCoordsRef = useRef<FaceCoordinates | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [faceCoords, setFaceCoords] = useState<FaceCoordinates | null>(null);
  const [isWarpReady, setIsWarpReady] = useState(false);
  const successfulWarpFramesRef = useRef(0);

  const isLocal = trackRef.participant?.isLocal ?? false;

  const isNone = activeFilter === 'none';
  const isAR = AR_FILTERS.includes(activeFilter);
  const isWarp = WARP_FILTERS.includes(activeFilter);

  // Auto-resume video playing so WebRTC stream never freezes in background/split windows
  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) {
      node.autoplay = true;
      node.playsInline = true;
      node.muted = true;

      const resumePlayback = () => {
        if (node.paused && !node.ended) {
          node.play().catch(() => {});
        }
      };

      node.addEventListener('pause', resumePlayback);
      node.addEventListener('suspend', resumePlayback);
      node.addEventListener('stalled', resumePlayback);
      node.addEventListener('waiting', resumePlayback);
      resumePlayback();
    }
  }, []);

  // Ensure remote track publication is always subscribed across all participants
  useEffect(() => {
    if (trackRef.publication && 'setSubscribed' in trackRef.publication) {
      try {
        (trackRef.publication as any).setSubscribed(true);
      } catch (err) {
        // ignore
      }
    }
  }, [trackRef.publication]);

  // Window/tab focus watchdog: ensure video plays immediately on focus/visibility change
  useEffect(() => {
    const handleVisibility = () => {
      const v = videoRef.current;
      if (v && v.paused && !v.ended) {
        v.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  // 1. Face Tracker: Active ONLY when an AR or Warp filter is chosen
  useEffect(() => {
    if (isNone) {
      if (trackerRef.current) {
        trackerRef.current.destroy();
        trackerRef.current = null;
      }
      latestFaceCoordsRef.current = null;
      setFaceCoords(null);
      return;
    }

    let tracker: FaceTracker | null = null;
    let timer: NodeJS.Timeout | null = null;
    let cancelled = false;

    const initTracker = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) {
        timer = setTimeout(initTracker, 150);
        return;
      }

      tracker = new FaceTracker(video, (coords) => {
        latestFaceCoordsRef.current = coords;
        setFaceCoords(coords);
      });
      trackerRef.current = tracker;
    };

    timer = setTimeout(initTracker, 60);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (tracker) {
        tracker.destroy();
        trackerRef.current = null;
      }
    };
  }, [isNone, trackRef]);

  // 2. WebGL Deformation Renderer: ONLY active when a Warp filter is chosen
  useEffect(() => {
    if (!isWarp) {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
      successfulWarpFramesRef.current = 0;
      setIsWarpReady(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new FaceDeformationRenderer(canvas);
    rendererRef.current = renderer;

    let cancelled = false;
    let startTime = performance.now();

    const renderStep = () => {
      if (cancelled) return;

      const video = videoRef.current;
      const curRenderer = rendererRef.current;

      if (
        video &&
        curRenderer &&
        video.readyState >= 2 &&
        video.videoWidth > 20 &&
        video.videoHeight > 20 &&
        !video.paused &&
        !video.ended
      ) {
        const elapsed = (performance.now() - startTime) / 1000.0;
        const rendered = curRenderer.renderFrame(
          video,
          activeFilter,
          latestFaceCoordsRef.current,
          elapsed,
          filterIntensity,
        );

        if (rendered) {
          successfulWarpFramesRef.current++;
          if (successfulWarpFramesRef.current >= 2) {
            setIsWarpReady(true);
          }
        } else {
          successfulWarpFramesRef.current = 0;
          setIsWarpReady(false);
        }
      } else {
        if (video && video.paused && !video.ended) {
          video.play().catch(() => {});
        }
        successfulWarpFramesRef.current = 0;
        setIsWarpReady(false);
      }
    };

    // Continuous requestAnimationFrame loop: Never dies on frame pauses or network jitter
    const renderLoop = () => {
      if (cancelled) return;
      renderStep();
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelled = true;
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      renderer.destroy();
      rendererRef.current = null;
      successfulWarpFramesRef.current = 0;
      setIsWarpReady(false);
    };
  }, [isWarp, activeFilter, filterIntensity]);

  // Show WebGL canvas ONLY for Warp filters when ready; otherwise show native VideoTrack
  const showCanvas = isWarp && isWarpReady;

  return (
    <div
      className="funny-video-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0a0a0c',
        borderRadius: 'inherit',
      }}
    >
      {/* 1. Underlying Native Video Track (Always mounted, 60fps hardware decoded) */}
      <VideoTrack
        trackRef={trackRef}
        ref={handleVideoRef}
        manageSubscription={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* 2. WebGL Processed Video Canvas (active ONLY for facial pixel warps) */}
      {isWarp && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: showCanvas ? 'block' : 'none',
            // opacity 0.999 prevents Chromium compositor from occluding/suspending underlying video element!
            opacity: showCanvas ? 0.999 : 0,
            zIndex: 2,
            pointerEvents: 'none',
            transition: 'opacity 0.15s ease-in-out',
            transform: isLocal ? 'rotateY(180deg)' : 'none',
          }}
        />
      )}

      {/* 3. Snapchat AR Props Layer (Puppy Dog, Kitty Cat, Thug Life, Disguise, Devil, Angel) */}
      {isAR && (
        <ARFaceOverlay
          filter={activeFilter}
          faceCoords={faceCoords}
          intensity={filterIntensity}
          isLocal={isLocal}
        />
      )}
    </div>
  );
}
