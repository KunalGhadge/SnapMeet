import { describe, it, expect } from 'vitest';
import {
  isCameraKitConfigured,
  createSourceFromMediaStreamTrack,
  createSourceFromVideoElement,
  formatLensDisplayName,
  calculateRenderResolution,
} from './cameraKitService';

describe('cameraKitService', () => {
  it('detects CameraKit configuration from environment', () => {
    const configured = isCameraKitConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('exports helper functions for media source adaptation', () => {
    expect(typeof createSourceFromMediaStreamTrack).toBe('function');
    expect(typeof createSourceFromVideoElement).toBe('function');
  });

  describe('formatLensDisplayName', () => {
    it('properly formats raw staging names like CamKit F Picture to Photo Booth Frame', () => {
      expect(formatLensDisplayName('CamKit F Picture')).toBe('Photo Booth Frame');
      expect(formatLensDisplayName('camkit f picture')).toBe('Photo Booth Frame');
      expect(formatLensDisplayName('CamKit_F_Picture')).toBe('Photo Booth Frame');
      expect(formatLensDisplayName('F Picture')).toBe('Photo Booth Frame');
    });

    it('formats CameraKit / face expressions to Blue Bear 3D', () => {
      expect(formatLensDisplayName('camkit')).toBe('Blue Bear 3D');
      expect(formatLensDisplayName('Camera Kit')).toBe('Blue Bear 3D');
      expect(formatLensDisplayName('Face Expressions')).toBe('Blue Bear 3D');
    });

    it('strips staging prefixes and capitalizes neatly', () => {
      expect(formatLensDisplayName('CK_Retro_Glitch')).toBe('Retro Glitch');
      expect(formatLensDisplayName('CamKit_Cyber_Glasses')).toBe('Cyber Shades');
      expect(formatLensDisplayName('none')).toBe('Normal');
      expect(formatLensDisplayName(null)).toBe('Normal');
    });
  });

  describe('calculateRenderResolution', () => {
    it('calculates aspect ratio matching portrait containers without excessive zoom', () => {
      // 460x780 container (aspect ~0.59)
      const res = calculateRenderResolution(460, 780);
      expect(res.height).toBe(1222);
      expect(res.width).toBe(720);
      expect(res.width % 2).toBe(0);
      expect(res.height % 2).toBe(0);
      // Aspect ratio of resolution should match container
      const expectedAspect = 460 / 780;
      const actualAspect = res.width / res.height;
      expect(Math.abs(actualAspect - expectedAspect)).toBeLessThan(0.01);
    });

    it('calculates aspect ratio matching landscape containers', () => {
      const res = calculateRenderResolution(1280, 720);
      expect(res.width).toBe(1280);
      expect(res.height).toBe(720);
    });

    it('falls back safely for invalid dimensions', () => {
      const res = calculateRenderResolution(0, 0);
      expect(res.width).toBe(1280);
      expect(res.height).toBe(720);
    });
  });
});

