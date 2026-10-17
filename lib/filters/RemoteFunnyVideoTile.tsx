'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TrackReference, VideoTrack } from '@livekit/components-react';
import {
  isCameraKitConfigured,
  applySnapLensPipeline,
  formatLensDisplayName,
  updateCameraKitRenderSize,
} from '../camerakit/cameraKitService';

interface RemoteFunnyVideoTileProps {
  trackRef: TrackReference;
  activeFilter?: string; // Snap Lens ID or 'none'
  filterIntensity?: number;
  onFilterChange?: (filter: string) => void;
}

export function RemoteFunnyVideoTile({
  trackRef,
  activeFilter = 'none',
}: RemoteFunnyVideoTileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lensContainerRef = useRef<HTMLDivElement | null>(null);

  const [isLensApplied, setIsLensApplied] = useState(false);
  const [activeLensName, setActiveLensName] = useState<string | null>(null);

  const isLocal = trackRef.participant?.isLocal ?? false;
  const isNone = !activeFilter || activeFilter === 'none';

  // Auto-resume video playback so WebRTC stream never pauses in background
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
      node.addEventListener('loadedmetadata', resumePlayback);
      resumePlayback();
    }
  }, []);

  // Ensure remote track publication is always subscribed
  useEffect(() => {
    if (trackRef.publication && 'setSubscribed' in trackRef.publication) {
      try {
        (trackRef.publication as any).setSubscribed(true);
      } catch (err) {
        // ignore
      }
    }
  }, [trackRef.publication]);

  // Window/tab focus watchdog: resume video on focus/visibility change
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

  // Listen for CameraKit runtime lens errors and safely fall back to native video
  useEffect(() => {
    const handleLensError = () => {
      console.warn('[RemoteFunnyVideoTile] Runtime lens error received, reverting to native stream.');
      const container = lensContainerRef.current;
      if (container) {
        container.innerHTML = '';
      }
      setIsLensApplied(false);
      setActiveLensName(null);
    };

    window.addEventListener('camerakit:lens-execution-error', handleLensError);
    return () => {
      window.removeEventListener('camerakit:lens-execution-error', handleLensError);
    };
  }, []);

  // ResizeObserver: Dynamically synchronize CameraKit internal render resolution
  // with the video tile container to eliminate zoom cropping on layout/window changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    let resizeTimer: any = null;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && isLensApplied) {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            updateCameraKitRenderSize(width, height);
          }, 150);
        }
      }
    });

    observer.observe(container);
    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [isLensApplied]);

  // Snap Camera Kit: apply lens pipeline to the active participant video
  useEffect(() => {
    let isCancelled = false;

    async function updatePipeline() {
      if (!isCameraKitConfigured() || typeof window === 'undefined') {
        return;
      }

      // If activeFilter is 'none', remove lens from session and show native stream
      if (isNone) {
        await applySnapLensPipeline({ lensId: 'none' });
        if (!isCancelled) {
          const container = lensContainerRef.current;
          if (container) {
            container.innerHTML = '';
          }
          setIsLensApplied(false);
          setActiveLensName(null);
        }
        return;
      }

      const track = trackRef.publication?.track;
      const mediaStreamTrack = track?.mediaStreamTrack;
      const videoElement = videoRef.current;
      const container = containerRef.current;

      const targetWidth = container?.clientWidth || 0;
      const targetHeight = container?.clientHeight || 0;

      const result = await applySnapLensPipeline({
        lensId: activeFilter,
        mediaStreamTrack,
        videoElement,
        targetWidth,
        targetHeight,
      });

      if (isCancelled) return;

      if (result.success && result.canvas) {
        const lensContainer = lensContainerRef.current;
        if (lensContainer) {
          result.canvas.style.position = 'absolute';
          result.canvas.style.top = '0';
          result.canvas.style.left = '0';
          result.canvas.style.width = '100%';
          result.canvas.style.height = '100%';
          result.canvas.style.objectFit = 'cover';
          result.canvas.style.objectPosition = 'center';
          result.canvas.style.pointerEvents = 'none';
          result.canvas.style.zIndex = '2';
          result.canvas.style.transform = 'none';

          if (result.canvas.parentElement !== lensContainer) {
            lensContainer.innerHTML = '';
            lensContainer.appendChild(result.canvas);
          }
        }
        setIsLensApplied(true);
        setActiveLensName(formatLensDisplayName(result.lensName));
      } else {
        setIsLensApplied(false);
        setActiveLensName(null);
      }
    }

    updatePipeline();

    return () => {
      isCancelled = true;
    };
  }, [activeFilter, isNone, isLocal, trackRef.publication?.track]);

  // Clean up DOM canvas on unmount
  useEffect(() => {
    const container = lensContainerRef.current;
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
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

      {/* 2. Official Snap Camera Kit Render Output Container */}
      <div
        ref={lensContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: isLensApplied ? 'block' : 'none',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* 3. Lens Active Indicator Badge */}
      {isLensApplied && activeLensName && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 252, 0, 0.35)',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#FFFC00',
            pointerEvents: 'none',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{activeLensName}</span>
        </div>
      )}
    </div>
  );
}
