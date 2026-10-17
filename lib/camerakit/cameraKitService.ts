'use client';

import type {
  CameraKit,
  CameraKitSession,
  CameraKitSource,
  Lens,
} from '@snap/camera-kit';

export type { CameraKit, CameraKitSession, CameraKitSource, Lens };

let cameraKitPromise: Promise<CameraKit> | null = null;
let activeSessionPromise: Promise<CameraKitSession> | null = null;
let activeSession: CameraKitSession | null = null;
let cachedLenses: Lens[] = [];
let cachedLensMap: Map<string, Lens> = new Map();
let currentApplyId = 0;

/**
 * Check if Snap Camera Kit is configured via environment variables
 */
export function isCameraKitConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SNAP_CAMERA_KIT_API_TOKEN &&
    process.env.NEXT_PUBLIC_SNAP_CAMERA_KIT_LENS_GROUP_ID
  );
}

/**
 * Safely load CameraKit SDK module in browser
 */
async function loadCameraKitModule() {
  if (typeof window === 'undefined') {
    throw new Error('CameraKit can only be loaded in a browser environment.');
  }
  return await import('@snap/camera-kit');
}

import './suppressWasmWarnings';

/**
 * Get or initialize the singleton CameraKit instance
 */
export async function getCameraKit(): Promise<CameraKit> {
  if (typeof window === 'undefined') {
    throw new Error('CameraKit can only be initialized in the browser.');
  }

  const apiToken = process.env.NEXT_PUBLIC_SNAP_CAMERA_KIT_API_TOKEN;
  if (!apiToken) {
    throw new Error('Missing NEXT_PUBLIC_SNAP_CAMERA_KIT_API_TOKEN in environment.');
  }

  if (!cameraKitPromise) {
    cameraKitPromise = (async () => {
      const { bootstrapCameraKit } = await loadCameraKitModule();
      return bootstrapCameraKit({
        apiToken,
        logger: 'noop',
      });
    })();
  }

  return cameraKitPromise;
}

/**
 * Get or create the SINGLETON CameraKitSession.
 * Snap Camera Kit Web SDK operates with one active session per CameraKit instance.
 */
export async function getOrCreateCameraKitSession(): Promise<CameraKitSession> {
  if (activeSession) {
    return activeSession;
  }

  if (!activeSessionPromise) {
    activeSessionPromise = (async () => {
      try {
        const cameraKit = await getCameraKit();
        const session = await cameraKit.createSession({
          renderWhileTabHidden: true,
        });

        session.events.addEventListener('error', ({ detail }) => {
          console.warn('[CameraKit Session Event Error]:', detail?.error?.name, detail);
          if (detail?.error?.name === 'LensExecutionError' && typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('camerakit:lens-execution-error', { detail })
            );
          }
        });

        activeSession = session;
        return session;
      } catch (err: any) {
        console.warn('[CameraKit] Session creation notice:', err?.message || err);
        activeSessionPromise = null;
        throw err;
      }
    })();
  }

  return activeSessionPromise;
}

/**
 * Backwards compatibility helper for existing callers
 */
export async function createRemoteCameraKitSession(
  _canvas?: HTMLCanvasElement
): Promise<CameraKitSession> {
  return await getOrCreateCameraKitSession();
}

/**
 * Load and cache all lenses from the configured Snap Lens Group
 */
export async function loadConfiguredSnapLenses(): Promise<Lens[]> {
  const groupId = process.env.NEXT_PUBLIC_SNAP_CAMERA_KIT_LENS_GROUP_ID;
  if (!groupId) {
    console.warn('[CameraKit] No NEXT_PUBLIC_SNAP_CAMERA_KIT_LENS_GROUP_ID provided.');
    return [];
  }

  if (cachedLenses.length > 0) {
    return cachedLenses;
  }

  try {
    const cameraKit = await getCameraKit();
    const { lenses, errors } = await cameraKit.lensRepository.loadLensGroups([groupId]);

    if (errors && errors.length > 0) {
      console.warn('[CameraKit] Lens group loading warnings:', errors);
    }

    cachedLenses = lenses || [];
    cachedLensMap.clear();
    for (const lens of cachedLenses) {
      cachedLensMap.set(lens.id, lens);
    }

    console.info(`[CameraKit] Successfully loaded ${cachedLenses.length} lenses from group ${groupId}`);
    return cachedLenses;
  } catch (err) {
    console.error('[CameraKit] Failed to load lenses from group:', err);
    return [];
  }
}

/**
 * Get a cached Lens by its Snap ID, or load it from the repository
 */
export async function getOrLoadLensById(lensId: string): Promise<Lens | undefined> {
  const cached = cachedLensMap.get(lensId);
  if (cached) return cached;

  const groupId = process.env.NEXT_PUBLIC_SNAP_CAMERA_KIT_LENS_GROUP_ID;
  if (!groupId) return undefined;

  try {
    const cameraKit = await getCameraKit();
    const lens = await cameraKit.lensRepository.loadLens(lensId, groupId);
    if (lens) {
      cachedLensMap.set(lens.id, lens);
    }
    return lens;
  } catch (e) {
    console.warn('[CameraKit] Failed to load lens by ID:', lensId, e);
    return undefined;
  }
}

export function getLoadedLensById(lensId: string): Lens | undefined {
  return cachedLensMap.get(lensId);
}

/**
 * Format lens names cleanly for UI presentation.
 * Cleans up raw developer/staging names like 'camkit', 'CamKit F Picture', 'CK_', etc.
 */
export function formatLensDisplayName(rawName?: string | null): string {
  if (!rawName || rawName === 'none') return 'Normal';

  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  // Known Snap staging / sample lens overrides
  if (
    lower === 'camkit' ||
    lower === 'camera kit' ||
    lower === 'camerakit' ||
    lower === 'face expressions' ||
    lower === 'faceexpressions'
  ) {
    return 'Blue Bear 3D';
  }
  if (
    lower.includes('f picture') ||
    lower.includes('f_picture') ||
    lower.includes('four picture') ||
    lower.includes('frame picture')
  ) {
    return 'Photo Booth Frame';
  }
  if (lower.includes('polaroid') || lower.includes('photo frame')) {
    return 'Photo Booth Frame';
  }
  if (lower.includes('bear') || lower.includes('blue bear')) {
    return 'Blue Bear 3D';
  }
  if (lower.includes('glitch') || lower.includes('vhs') || lower.includes('retro')) {
    return 'Retro Glitch';
  }
  if (lower.includes('glasses') || lower.includes('shades')) {
    return 'Cyber Shades';
  }
  if (lower.includes('distortion') || lower.includes('funny face') || lower.includes('warp')) {
    return 'Face Warp';
  }

  // Strip technical staging prefixes like "Camera Kit ", "CamKit ", "CK_", "CK "
  let cleaned = trimmed.replace(/^(camera\s*kit|camkit|ck)[\s_-]*/i, '').trim();

  // If cleaning left "F Picture" or single letters
  if (/^f[\s_-]*picture/i.test(cleaned)) {
    return 'Photo Booth Frame';
  }

  // If cleaning left an empty string, fallback to friendly name
  if (!cleaned) {
    return 'AR Effect';
  }

  // Title-case and clean delimiters
  cleaned = cleaned
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return cleaned;
}

/**
 * Calculate optimal render dimensions that match the container aspect ratio.
 * This prevents center-cropping and excessive zoom when landscape webcams are placed in portrait tiles.
 */
export function calculateRenderResolution(width: number, height: number): { width: number; height: number } {
  if (!width || !height || width <= 0 || height <= 0) {
    return { width: 1280, height: 720 };
  }

  const aspect = width / height;
  let targetW: number;
  let targetH: number;

  if (aspect >= 1) {
    // Landscape container (e.g. 16:9, 4:3)
    targetW = 1280;
    targetH = Math.round(1280 / aspect);
    if (targetH > 720) {
      targetH = 720;
      targetW = Math.round(720 * aspect);
    }
  } else {
    // Portrait container (e.g. 9:16, 3:4 side-by-side call view)
    targetH = 1280;
    targetW = Math.round(1280 * aspect);
    if (targetW > 720) {
      targetW = 720;
      targetH = Math.round(720 / aspect);
    }
  }

  // WebGL textures require even dimensions
  targetW = Math.round(targetW / 2) * 2;
  targetH = Math.round(targetH / 2) * 2;

  // Clamp within safe GPU limits
  targetW = Math.max(320, Math.min(1280, targetW));
  targetH = Math.max(320, Math.min(1280, targetH));

  return { width: targetW, height: targetH };
}

// Media source tracking to avoid redundant detachment/reattachment cycles
let activeSource: CameraKitSource | null = null;
let activeSourceTrackId: string | null = null;

/**
 * Update CameraKit render resolution dynamically to match new container dimensions (e.g. on window resize)
 */
export async function updateCameraKitRenderSize(
  targetWidth: number,
  targetHeight: number
): Promise<void> {
  if (!activeSource || !activeSession || targetWidth <= 0 || targetHeight <= 0) return;
  const { width: rw, height: rh } = calculateRenderResolution(targetWidth, targetHeight);
  try {
    await activeSource.setRenderSize(rw, rh);
  } catch {
    // ignore
  }
}

/**
 * Create a CameraKit source from a MediaStreamTrack
 */
export async function createSourceFromMediaStreamTrack(
  mediaStreamTrack: MediaStreamTrack
): Promise<CameraKitSource> {
  const { createMediaStreamSource } = await loadCameraKitModule();
  const stream = new MediaStream([mediaStreamTrack]);
  return createMediaStreamSource(stream, {
    cameraType: 'user',
    disableSourceAudio: true,
  });
}

/**
 * Create a CameraKit source from an HTMLVideoElement
 */
export async function createSourceFromVideoElement(
  video: HTMLVideoElement
): Promise<CameraKitSource> {
  const { createVideoSource } = await loadCameraKitModule();
  return createVideoSource(video, {
    cameraType: 'user',
  });
}

/**
 * Apply a Snap Lens to the shared session and connect the video source
 */
export async function applySnapLensPipeline({
  lensId,
  mediaStreamTrack,
  videoElement,
  targetWidth,
  targetHeight,
}: {
  lensId: string;
  mediaStreamTrack?: MediaStreamTrack | null;
  videoElement?: HTMLVideoElement | null;
  targetWidth?: number;
  targetHeight?: number;
}): Promise<{
  success: boolean;
  canvas: HTMLCanvasElement | null;
  lensName: string | null;
}> {
  if (!isCameraKitConfigured() || typeof window === 'undefined') {
    return { success: false, canvas: null, lensName: null };
  }

  const applyId = ++currentApplyId;

  try {
    const session = await getOrCreateCameraKitSession();
    if (applyId !== currentApplyId) {
      return { success: false, canvas: null, lensName: null };
    }

    // 1. Normal / Reset filter
    if (!lensId || lensId === 'none') {
      try {
        await session.removeLens();
      } catch (e) {
        // ignore
      }
      return { success: true, canvas: null, lensName: null };
    }

    // 2. Fetch Lens
    const lens = await getOrLoadLensById(lensId);
    if (!lens) {
      console.warn(`[CameraKit] Lens "${lensId}" could not be found.`);
      return { success: false, canvas: null, lensName: null };
    }

    if (applyId !== currentApplyId) {
      return { success: false, canvas: null, lensName: null };
    }

    // 3. Connect media source ONLY if track or element changed
    // Reconnecting on every lens change causes WebGL texture collisions and crashes
    const trackId = mediaStreamTrack?.id || null;
    const needsNewSource = !activeSource || (trackId && activeSourceTrackId !== trackId);

    if (needsNewSource) {
      if (mediaStreamTrack && mediaStreamTrack.readyState === 'live') {
        const source = await createSourceFromMediaStreamTrack(mediaStreamTrack);
        await session.setSource(source);
        activeSource = source;
        activeSourceTrackId = trackId;
      } else if (videoElement && videoElement.videoWidth > 0) {
        const source = await createSourceFromVideoElement(videoElement);
        await session.setSource(source);
        activeSource = source;
        activeSourceTrackId = null;
      }
    }

    if (applyId !== currentApplyId) {
      return { success: false, canvas: null, lensName: null };
    }

    // 4. Apply Lens to session with safe rollback on error
    let applied = false;
    try {
      applied = await session.applyLens(lens);
    } catch (applyErr: any) {
      console.warn(`[CameraKit] Lens "${lens.name}" failed to apply:`, applyErr?.message || applyErr);
      try {
        await session.removeLens();
      } catch {}
      return { success: false, canvas: null, lensName: null };
    }

    if (applied && applyId === currentApplyId) {
      await session.play('live');

      // 5. Match render resolution to container aspect ratio so lens is never stretched or zoomed
      if (activeSource && targetWidth && targetHeight) {
        const { width: rw, height: rh } = calculateRenderResolution(targetWidth, targetHeight);
        try {
          await activeSource.setRenderSize(rw, rh);
        } catch {
          // ignore
        }
      }

      return {
        success: true,
        canvas: session.output.live,
        lensName: formatLensDisplayName(lens.name),
      };
    }

    return { success: false, canvas: null, lensName: null };
  } catch (err) {
    console.warn('[CameraKit] Failed to apply lens pipeline:', err);
    try {
      if (activeSession) {
        await activeSession.removeLens();
      }
    } catch {}
    return { success: false, canvas: null, lensName: null };
  }
}

/**
 * Teardown CameraKit completely when leaving the meeting
 */
export async function teardownCameraKit() {
  activeSource = null;
  activeSourceTrackId = null;

  if (activeSession) {
    try {
      await activeSession.destroy();
    } catch {}
    activeSession = null;
  }
  activeSessionPromise = null;

  if (cameraKitPromise) {
    try {
      const ck = await cameraKitPromise;
      await ck.destroy();
    } catch {}
    cameraKitPromise = null;
  }
}

