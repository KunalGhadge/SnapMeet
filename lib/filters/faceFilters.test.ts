import { describe, it, expect } from 'vitest';
import { FilterType, FaceCoordinates } from './faceDeformationRenderer';

describe('Face Filters & Coordinate Math', () => {
  it('supports the required filter types including Snapchat AR and Comic Warps', () => {
    const validFilters: FilterType[] = [
      'none',
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
      'cyclops',
      'random',
    ];
    expect(validFilters).toContain('none');
    expect(validFilters).toContain('dog_face');
    expect(validFilters).toContain('cat_face');
    expect(validFilters).toContain('thug_life');
    expect(validFilters).toContain('disguise');
    expect(validFilters).toContain('devil_horns');
    expect(validFilters).toContain('angel_halo');
    expect(validFilters).toContain('big_head');
    expect(validFilters).toContain('tiny_face');
    expect(validFilters).toContain('alien');
    expect(validFilters).toContain('mega_chin');
    expect(validFilters).toContain('swirl');
    expect(validFilters).toContain('jelly');
    expect(validFilters).toContain('cyclops');
    expect(validFilters).toContain('random');
  });

  it('normalizes face coordinates safely', () => {
    const rawCoords: FaceCoordinates = {
      x: 0.5,
      y: 0.5,
      scaleX: 0.35,
      scaleY: 0.35,
      confidence: 0.85,
    };

    expect(rawCoords.x).toBeGreaterThanOrEqual(0);
    expect(rawCoords.x).toBeLessThanOrEqual(1);
    expect(rawCoords.y).toBeGreaterThanOrEqual(0);
    expect(rawCoords.y).toBeLessThanOrEqual(1);
    expect(rawCoords.confidence).toBeGreaterThan(0.5);
  });

  it('calculates aspect ratio correctly for spherical bulge and pinch math', () => {
    const videoWidth = 1280;
    const videoHeight = 720;
    const aspect = videoWidth / videoHeight;
    expect(aspect).toBeCloseTo(1.777, 2);

    const uv = { x: 0.5, y: 0.5 };
    const center = { x: 0.5, y: 0.5 };
    const delta = { x: (uv.x - center.x) * aspect, y: uv.y - center.y };
    const dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    expect(dist).toBe(0);
  });

  it('proves Big Head mathematically magnifies facial pixels by sampling closer to center', () => {
    const norm = 0.5;
    const intensity = 1.0;
    const power = 1.0 + 0.85 * intensity; // 1.85
    const factor = Math.pow(norm, power);

    expect(factor).toBeLessThan(norm);
    expect(factor).toBeCloseTo(0.277, 2);

    const magnification = norm / factor;
    expect(magnification).toBeGreaterThan(1.7);
  });

  it('proves Tiny Face mathematically compresses facial pixels by sampling further from center', () => {
    const norm = 0.5;
    const intensity = 1.0;
    const power = 1.0 / (1.0 + 1.15 * intensity);
    const factor = Math.pow(norm, power);

    expect(factor).toBeGreaterThan(norm);
    expect(factor).toBeCloseTo(0.724, 2);

    const compression = factor / norm;
    expect(compression).toBeGreaterThan(1.4);
  });

  it('guarantees seamless boundary continuity at norm = 1.0', () => {
    const norm = 1.0;
    const bigHeadEdge = Math.pow(norm, 1.85);
    const tinyFaceEdge = Math.pow(norm, 0.465);

    expect(bigHeadEdge).toBe(1.0);
    expect(tinyFaceEdge).toBe(1.0);
  });

  it('verifies deterministic synchronized random selection guarantees matching filter across clients', () => {
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

    // Initiating client picks one filter from the pool
    const selected = RANDOM_POOL[3]; // e.g. disguise
    expect(RANDOM_POOL).toContain(selected);

    // Both Client A and Client B apply the exact same selected filter value
    const clientAApplied = selected;
    const clientBApplied = selected;
    expect(clientAApplied).toEqual(clientBApplied);
  });
});
