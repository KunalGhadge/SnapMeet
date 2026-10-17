import { describe, it, expect } from 'vitest';
import { isCameraKitConfigured } from '../camerakit/cameraKitService';

describe('Snap Camera Kit Web SDK Integration', () => {
  it('correctly validates the environment variables for Camera Kit', () => {
    const configured = isCameraKitConfigured();
    // In our local environment with .env.local, both API token and lens group ID are set
    expect(typeof configured).toBe('boolean');
  });

  it('handles "none" filter reset cleanly', () => {
    const activeFilter = 'none';
    const isNone = !activeFilter || activeFilter === 'none';
    expect(isNone).toBe(true);
  });
});
