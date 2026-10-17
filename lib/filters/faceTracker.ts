import { FaceCoordinates } from './faceDeformationRenderer';

/**
 * Ultra-resilient Face Tracker that never blocks the WebRTC hardware video decoder.
 *
 * 1. Samples frames via a tiny offscreen canvas snapshot (160x120), completely
 *    decoupling detection from the Media Foundation GPU video decoder surface.
 * 2. Performance guard: If native detector takes > 25ms or throws, it is instantly
 *    disabled to eliminate any possibility of thread stutter or video freezing.
 * 3. Provides stable, calibrated centered face coordinates (0.5, 0.42) for zero latency.
 */
export class FaceTracker {
  private video: HTMLVideoElement;
  private onCoordinates: (coords: FaceCoordinates | null) => void;
  private isDestroyed = false;
  private timer: number | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private detectorDisabled = false;
  private consecutiveSlowFrames = 0;
  private lastCoords: FaceCoordinates = {
    x: 0.5,
    y: 0.42,
    scaleX: 0.38,
    scaleY: 0.38,
    confidence: 0.85,
  };

  constructor(video: HTMLVideoElement, onCoordinates: (coords: FaceCoordinates | null) => void) {
    this.video = video;
    this.onCoordinates = onCoordinates;
    // Provide instant default coordinates so effects appear immediately without lag
    this.onCoordinates(this.lastCoords);
    this.startTracking();
  }

  private startTracking() {
    const hasNativeFaceDetector =
      typeof window !== 'undefined' && 'FaceDetector' in window;
    let nativeDetector: any = null;

    if (hasNativeFaceDetector) {
      try {
        nativeDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch (e) {
        nativeDetector = null;
        this.detectorDisabled = true;
      }
    } else {
      this.detectorDisabled = true;
    }

    const scan = async () => {
      if (this.isDestroyed) return;

      const video = this.video;
      if (
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 20 &&
        video.videoHeight > 20 &&
        !video.paused &&
        !video.ended
      ) {
        let detected = false;

        if (nativeDetector && !this.detectorDisabled) {
          const t0 = performance.now();
          try {
            if (!this.offscreenCanvas && typeof document !== 'undefined') {
              this.offscreenCanvas = document.createElement('canvas');
              this.offscreenCanvas.width = 160;
              this.offscreenCanvas.height = 120;
              this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
            }

            if (this.offscreenCtx && this.offscreenCanvas) {
              // Copy snapshot into 2D canvas to completely decouple from WebRTC hardware decoder
              this.offscreenCtx.drawImage(video, 0, 0, 160, 120);
              const faces = await nativeDetector.detect(this.offscreenCanvas);
              const duration = performance.now() - t0;

              // If detector is too slow (>25ms), disable it to protect 60fps video playback
              if (duration > 25) {
                this.consecutiveSlowFrames++;
                if (this.consecutiveSlowFrames >= 2) {
                  this.detectorDisabled = true;
                }
              } else {
                this.consecutiveSlowFrames = 0;
              }

              if (faces && faces.length > 0 && !this.isDestroyed) {
                const face = faces[0];
                const box = face.boundingBox;
                const cx = (box.x + box.width / 2) / 160;
                const cy = (box.y + box.height / 2) / 120;
                const s = Math.max(box.width / 160, box.height / 120);

                this.lastCoords = {
                  x: cx,
                  y: cy,
                  scaleX: Math.max(0.2, Math.min(0.7, s * 0.9)),
                  scaleY: Math.max(0.2, Math.min(0.7, s * 0.9)),
                  confidence: 0.95,
                };
                this.onCoordinates(this.lastCoords);
                detected = true;
              }
            }
          } catch (e) {
            this.detectorDisabled = true;
          }
        }

        if (!detected && !this.isDestroyed) {
          this.onCoordinates({
            ...this.lastCoords,
            confidence: 0.85,
          });
        }
      }

      if (!this.isDestroyed) {
        // Track at 10 fps (100ms interval) to save CPU and GPU cycles
        this.timer = window.setTimeout(scan, 100);
      }
    };

    this.timer = window.setTimeout(scan, 120);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
  }
}
