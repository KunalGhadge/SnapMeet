'use client';

import React from 'react';
import { FaceCoordinates, FilterType } from './faceDeformationRenderer';

interface ARFaceOverlayProps {
  filter: FilterType;
  faceCoords: FaceCoordinates | null;
  intensity?: number;
  isLocal?: boolean;
}

export function ARFaceOverlay({
  filter,
  faceCoords,
  intensity = 1.0,
  isLocal = false,
}: ARFaceOverlayProps) {
  // If no AR filter or coords not available, render nothing
  const isARFilter = [
    'dog_face',
    'cat_face',
    'thug_life',
    'disguise',
    'devil_horns',
    'angel_halo',
  ].includes(filter);

  if (!isARFilter || !faceCoords) return null;

  // Normalized coordinates [0, 100] percent
  const cx = faceCoords.x * 100;
  const cy = faceCoords.y * 100;
  const fw = faceCoords.scaleX * 100;
  const fh = faceCoords.scaleY * 100;

  // Anatomical anchors derived from head center and scale
  const headTopY = cy - fh * 0.46;
  const eyesY = cy - fh * 0.12;
  const noseY = cy + fh * 0.06;
  const mouthY = cy + fh * 0.28;

  const leftEyeX = cx - fw * 0.22;
  const rightEyeX = cx + fw * 0.22;

  const scaleMultiplier = Math.max(0.6, Math.min(1.6, intensity));

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        transform: isLocal ? 'rotateY(180deg)' : 'none',
      }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="neon-glow-red" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="neon-glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients */}
        <linearGradient id="dog-ear-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8d5b4c" />
          <stop offset="100%" stopColor="#5c382e" />
        </linearGradient>

        <linearGradient id="cat-ear-pink" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#fda4af" />
        </linearGradient>

        <linearGradient id="devil-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        <linearGradient id="gold-halo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>

      {/* ========================================================= */}
      {/* 1. 🐶 SNAPCHAT PUPPY DOG FILTER                           */}
      {/* ========================================================= */}
      {filter === 'dog_face' && (
        <g id="snapchat-dog-filter">
          {/* Left Floppy Ear */}
          <path
            d={`M ${cx - fw * 0.38} ${headTopY} 
               C ${cx - fw * 0.65} ${headTopY - fh * 0.2}, 
                 ${cx - fw * 0.75} ${headTopY + fh * 0.35}, 
                 ${cx - fw * 0.52} ${headTopY + fh * 0.48}
               C ${cx - fw * 0.42} ${headTopY + fh * 0.45}, 
                 ${cx - fw * 0.32} ${headTopY + fh * 0.25}, 
                 ${cx - fw * 0.32} ${headTopY} Z`}
            fill="url(#dog-ear-grad)"
            stroke="#3d231c"
            strokeWidth="0.4"
          />
          {/* Left Inner Ear Pink */}
          <path
            d={`M ${cx - fw * 0.4} ${headTopY + fh * 0.08} 
               C ${cx - fw * 0.6} ${headTopY + fh * 0.05}, 
                 ${cx - fw * 0.65} ${headTopY + fh * 0.35}, 
                 ${cx - fw * 0.5} ${headTopY + fh * 0.42} Z`}
            fill="#f472b6"
            opacity="0.75"
          />

          {/* Right Floppy Ear */}
          <path
            d={`M ${cx + fw * 0.38} ${headTopY} 
               C ${cx + fw * 0.65} ${headTopY - fh * 0.2}, 
                 ${cx + fw * 0.75} ${headTopY + fh * 0.35}, 
                 ${cx + fw * 0.52} ${headTopY + fh * 0.48}
               C ${cx + fw * 0.42} ${headTopY + fh * 0.45}, 
                 ${cx + fw * 0.32} ${headTopY + fh * 0.25}, 
                 ${cx + fw * 0.32} ${headTopY} Z`}
            fill="url(#dog-ear-grad)"
            stroke="#3d231c"
            strokeWidth="0.4"
          />
          {/* Right Inner Ear Pink */}
          <path
            d={`M ${cx + fw * 0.4} ${headTopY + fh * 0.08} 
               C ${cx + fw * 0.6} ${headTopY + fh * 0.05}, 
                 ${cx + fw * 0.65} ${headTopY + fh * 0.35}, 
                 ${cx + fw * 0.5} ${headTopY + fh * 0.42} Z`}
            fill="#f472b6"
            opacity="0.75"
          />

          {/* Cute Puppy Dog Nose */}
          <ellipse
            cx={cx}
            cy={noseY}
            rx={fw * 0.16 * scaleMultiplier}
            ry={fh * 0.11 * scaleMultiplier}
            fill="#1e1b18"
          />
          {/* Nose Specular Highlight */}
          <ellipse
            cx={cx - fw * 0.04 * scaleMultiplier}
            cy={noseY - fh * 0.03 * scaleMultiplier}
            rx={fw * 0.05 * scaleMultiplier}
            ry={fh * 0.025 * scaleMultiplier}
            fill="#ffffff"
            opacity="0.8"
          />
          {/* Nostril indentations */}
          <ellipse
            cx={cx - fw * 0.07 * scaleMultiplier}
            cy={noseY + fh * 0.03 * scaleMultiplier}
            rx={fw * 0.03}
            ry={fh * 0.02}
            fill="#0f0e0c"
          />
          <ellipse
            cx={cx + fw * 0.07 * scaleMultiplier}
            cy={noseY + fh * 0.03 * scaleMultiplier}
            rx={fw * 0.03}
            ry={fh * 0.02}
            fill="#0f0e0c"
          />

          {/* Cartoon Dog Tongue */}
          <path
            d={`M ${cx - fw * 0.1} ${mouthY}
               C ${cx - fw * 0.12} ${mouthY + fh * 0.24 * scaleMultiplier},
                 ${cx + fw * 0.12} ${mouthY + fh * 0.24 * scaleMultiplier},
                 ${cx + fw * 0.1} ${mouthY} Z`}
            fill="#f43f5e"
            stroke="#be123c"
            strokeWidth="0.3"
          />
          <line
            x1={cx}
            y1={mouthY}
            x2={cx}
            y2={mouthY + fh * 0.16 * scaleMultiplier}
            stroke="#be123c"
            strokeWidth="0.3"
          />
        </g>
      )}

      {/* ========================================================= */}
      {/* 2. 🐱 SNAPCHAT CUTE CAT / KITTY FILTER                    */}
      {/* ========================================================= */}
      {filter === 'cat_face' && (
        <g id="snapchat-cat-filter">
          {/* Left Cat Ear */}
          <polygon
            points={`${cx - fw * 0.42},${headTopY + fh * 0.1} ${cx - fw * 0.35},${headTopY - fh * 0.28 * scaleMultiplier} ${cx - fw * 0.12},${headTopY + fh * 0.02}`}
            fill="#27272a"
            stroke="#18181b"
            strokeWidth="0.4"
          />
          <polygon
            points={`${cx - fw * 0.38},${headTopY + fh * 0.06} ${cx - fw * 0.34},${headTopY - fh * 0.2 * scaleMultiplier} ${cx - fw * 0.18},${headTopY}`}
            fill="url(#cat-ear-pink)"
          />

          {/* Right Cat Ear */}
          <polygon
            points={`${cx + fw * 0.42},${headTopY + fh * 0.1} ${cx + fw * 0.35},${headTopY - fh * 0.28 * scaleMultiplier} ${cx + fw * 0.12},${headTopY + fh * 0.02}`}
            fill="#27272a"
            stroke="#18181b"
            strokeWidth="0.4"
          />
          <polygon
            points={`${cx + fw * 0.38},${headTopY + fh * 0.06} ${cx + fw * 0.34},${headTopY - fh * 0.2 * scaleMultiplier} ${cx + fw * 0.18},${headTopY}`}
            fill="url(#cat-ear-pink)"
          />

          {/* Cute Pink Triangular Nose */}
          <polygon
            points={`${cx - fw * 0.07},${noseY - fh * 0.02} ${cx + fw * 0.07},${noseY - fh * 0.02} ${cx},${noseY + fh * 0.05}`}
            fill="#fb7185"
          />
          {/* Mouth curves */}
          <path
            d={`M ${cx - fw * 0.08} ${noseY + fh * 0.1} Q ${cx - fw * 0.04} ${noseY + fh * 0.14} ${cx} ${noseY + fh * 0.06} Q ${cx + fw * 0.04} ${noseY + fh * 0.14} ${cx + fw * 0.08} ${noseY + fh * 0.1}`}
            fill="none"
            stroke="#fb7185"
            strokeWidth="0.4"
            strokeLinecap="round"
          />

          {/* Left Whiskers */}
          <line
            x1={cx - fw * 0.14}
            y1={noseY - fh * 0.02}
            x2={cx - fw * 0.52 * scaleMultiplier}
            y2={noseY - fh * 0.07}
            stroke="#ffffff"
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <line
            x1={cx - fw * 0.15}
            y1={noseY + fh * 0.04}
            x2={cx - fw * 0.54 * scaleMultiplier}
            y2={noseY + fh * 0.03}
            stroke="#ffffff"
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <line
            x1={cx - fw * 0.14}
            y1={noseY + fh * 0.09}
            x2={cx - fw * 0.5 * scaleMultiplier}
            y2={noseY + fh * 0.13}
            stroke="#ffffff"
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Right Whiskers */}
          <line
            x1={cx + fw * 0.14}
            y1={noseY - fh * 0.02}
            x2={cx + fw * 0.52 * scaleMultiplier}
            y2={noseY - fh * 0.07}
            stroke="#ffffff"
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <line
            x1={cx + fw * 0.15}
            y1={noseY + fh * 0.04}
            x2={cx + fw * 0.54 * scaleMultiplier}
            y2={noseY + fh * 0.03}
            stroke="#ffffff"
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <line
            x1={cx + fw * 0.14}
            y1={noseY + fh * 0.09}
            x2={cx + fw * 0.5 * scaleMultiplier}
            y2={noseY + fh * 0.13}
            stroke="#ffffff"
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      )}

      {/* ========================================================= */}
      {/* 3. 🕶️ THUG LIFE / DEAL WITH IT PIXEL GLASSES & CIGAR     */}
      {/* ========================================================= */}
      {filter === 'thug_life' && (
        <g id="thug-life-filter">
          {/* 8-Bit Pixel Sunglasses */}
          {/* Bridge */}
          <rect
            x={cx - fw * 0.06}
            y={eyesY - fh * 0.03}
            width={fw * 0.12}
            height={fh * 0.04}
            fill="#09090b"
          />

          {/* Left Lens Box */}
          <rect
            x={cx - fw * 0.38 * scaleMultiplier}
            y={eyesY - fh * 0.06 * scaleMultiplier}
            width={fw * 0.33 * scaleMultiplier}
            height={fh * 0.15 * scaleMultiplier}
            fill="#000000"
            stroke="#27272a"
            strokeWidth="0.3"
          />
          {/* Left Pixel White Highlight Glint */}
          <rect
            x={cx - fw * 0.34 * scaleMultiplier}
            y={eyesY - fh * 0.04 * scaleMultiplier}
            width={fw * 0.06 * scaleMultiplier}
            height={fh * 0.03 * scaleMultiplier}
            fill="#ffffff"
          />
          <rect
            x={cx - fw * 0.26 * scaleMultiplier}
            y={eyesY - fh * 0.01 * scaleMultiplier}
            width={fw * 0.04 * scaleMultiplier}
            height={fh * 0.02 * scaleMultiplier}
            fill="#ffffff"
          />

          {/* Right Lens Box */}
          <rect
            x={cx + fw * 0.05 * scaleMultiplier}
            y={eyesY - fh * 0.06 * scaleMultiplier}
            width={fw * 0.33 * scaleMultiplier}
            height={fh * 0.15 * scaleMultiplier}
            fill="#000000"
            stroke="#27272a"
            strokeWidth="0.3"
          />
          {/* Right Pixel White Highlight Glint */}
          <rect
            x={cx + fw * 0.09 * scaleMultiplier}
            y={eyesY - fh * 0.04 * scaleMultiplier}
            width={fw * 0.06 * scaleMultiplier}
            height={fh * 0.03 * scaleMultiplier}
            fill="#ffffff"
          />
          <rect
            x={cx + fw * 0.17 * scaleMultiplier}
            y={eyesY - fh * 0.01 * scaleMultiplier}
            width={fw * 0.04 * scaleMultiplier}
            height={fh * 0.02 * scaleMultiplier}
            fill="#ffffff"
          />

          {/* Pixel Cigar at Mouth */}
          <g transform={`rotate(-12 ${cx + fw * 0.18} ${mouthY + fh * 0.05})`}>
            {/* Brown body */}
            <rect
              x={cx + fw * 0.1}
              y={mouthY + fh * 0.04}
              width={fw * 0.28 * scaleMultiplier}
              height={fh * 0.055 * scaleMultiplier}
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="0.2"
            />
            {/* White ash tip */}
            <rect
              x={cx + fw * 0.38 * scaleMultiplier}
              y={mouthY + fh * 0.04}
              width={fw * 0.06}
              height={fh * 0.055 * scaleMultiplier}
              fill="#e2e8f0"
            />
            {/* Red burning ember */}
            <rect
              x={cx + fw * 0.44 * scaleMultiplier}
              y={mouthY + fh * 0.045}
              width={fw * 0.02}
              height={fh * 0.045 * scaleMultiplier}
              fill="#ef4444"
              filter="url(#neon-glow-red)"
            />
          </g>

          {/* Golden Bling Chain */}
          <path
            d={`M ${cx - fw * 0.32} ${mouthY + fh * 0.25} 
               Q ${cx} ${mouthY + fh * 0.45 * scaleMultiplier} 
                 ${cx + fw * 0.32} ${mouthY + fh * 0.25}`}
            fill="none"
            stroke="url(#gold-halo)"
            strokeWidth="0.9"
            strokeDasharray="0.8 0.4"
          />
          {/* Gold Dollar Medallion */}
          <circle
            cx={cx}
            cy={mouthY + fh * 0.45 * scaleMultiplier}
            r={fw * 0.08 * scaleMultiplier}
            fill="url(#gold-halo)"
            stroke="#ca8a04"
            strokeWidth="0.3"
          />
          <text
            x={cx}
            y={mouthY + fh * 0.47 * scaleMultiplier}
            fontSize={fw * 0.09 * scaleMultiplier}
            fontWeight="bold"
            textAnchor="middle"
            fill="#422006"
          >
            $
          </text>
        </g>
      )}

      {/* ========================================================= */}
      {/* 4. 🥸 GROUCHO MARX / COMEDY DISGUISE                      */}
      {/* ========================================================= */}
      {filter === 'disguise' && (
        <g id="disguise-filter">
          {/* Bushy Eyebrows */}
          <ellipse
            cx={leftEyeX}
            cy={eyesY - fh * 0.1 * scaleMultiplier}
            rx={fw * 0.16 * scaleMultiplier}
            ry={fh * 0.05 * scaleMultiplier}
            fill="#18181b"
            transform={`rotate(-6 ${leftEyeX} ${eyesY - fh * 0.1})`}
          />
          <ellipse
            cx={rightEyeX}
            cy={eyesY - fh * 0.1 * scaleMultiplier}
            rx={fw * 0.16 * scaleMultiplier}
            ry={fh * 0.05 * scaleMultiplier}
            fill="#18181b"
            transform={`rotate(6 ${rightEyeX} ${eyesY - fh * 0.1})`}
          />

          {/* Thick Black Eyeglass Rims */}
          <circle
            cx={leftEyeX}
            cy={eyesY}
            r={fw * 0.15 * scaleMultiplier}
            fill="rgba(255,255,255,0.08)"
            stroke="#09090b"
            strokeWidth="1.2"
          />
          <circle
            cx={rightEyeX}
            cy={eyesY}
            r={fw * 0.15 * scaleMultiplier}
            fill="rgba(255,255,255,0.08)"
            stroke="#09090b"
            strokeWidth="1.2"
          />
          <line
            x1={leftEyeX + fw * 0.15 * scaleMultiplier}
            y1={eyesY}
            x2={rightEyeX - fw * 0.15 * scaleMultiplier}
            y2={eyesY}
            stroke="#09090b"
            strokeWidth="1.2"
          />

          {/* Giant Fleshy Comedy Nose */}
          <ellipse
            cx={cx}
            cy={noseY + fh * 0.02}
            rx={fw * 0.17 * scaleMultiplier}
            ry={fh * 0.14 * scaleMultiplier}
            fill="#fbcfe8"
            stroke="#f472b6"
            strokeWidth="0.4"
          />
          {/* Nose Highlight */}
          <ellipse
            cx={cx - fw * 0.05}
            cy={noseY}
            rx={fw * 0.04}
            ry={fh * 0.03}
            fill="#ffffff"
            opacity="0.6"
          />

          {/* Bushy Comedy Mustache */}
          <path
            d={`M ${cx - fw * 0.28 * scaleMultiplier} ${mouthY + fh * 0.06}
               C ${cx - fw * 0.18} ${mouthY - fh * 0.04}, 
                 ${cx - fw * 0.06} ${mouthY - fh * 0.02}, 
                 ${cx} ${mouthY + fh * 0.02}
               C ${cx + fw * 0.06} ${mouthY - fh * 0.02}, 
                 ${cx + fw * 0.18} ${mouthY - fh * 0.04}, 
                 ${cx + fw * 0.28 * scaleMultiplier} ${mouthY + fh * 0.06}
               C ${cx + fw * 0.2} ${mouthY + fh * 0.12}, 
                 ${cx - fw * 0.2} ${mouthY + fh * 0.12}, 
                 ${cx - fw * 0.28 * scaleMultiplier} ${mouthY + fh * 0.06} Z`}
            fill="#18181b"
          />
        </g>
      )}

      {/* ========================================================= */}
      {/* 5. 😈 DEVIL HORNS & NEON GLOW                             */}
      {/* ========================================================= */}
      {filter === 'devil_horns' && (
        <g id="devil-horns-filter" filter="url(#neon-glow-red)">
          {/* Left Horn */}
          <path
            d={`M ${cx - fw * 0.32} ${headTopY + fh * 0.06}
               C ${cx - fw * 0.44} ${headTopY - fh * 0.12}, 
                 ${cx - fw * 0.52} ${headTopY - fh * 0.28 * scaleMultiplier}, 
                 ${cx - fw * 0.38} ${headTopY - fh * 0.32 * scaleMultiplier}
               C ${cx - fw * 0.3} ${headTopY - fh * 0.2}, 
                 ${cx - fw * 0.22} ${headTopY - fh * 0.05}, 
                 ${cx - fw * 0.2} ${headTopY + fh * 0.04} Z`}
            fill="url(#devil-grad)"
            stroke="#f87171"
            strokeWidth="0.4"
          />

          {/* Right Horn */}
          <path
            d={`M ${cx + fw * 0.32} ${headTopY + fh * 0.06}
               C ${cx + fw * 0.44} ${headTopY - fh * 0.12}, 
                 ${cx + fw * 0.52} ${headTopY - fh * 0.28 * scaleMultiplier}, 
                 ${cx + fw * 0.38} ${headTopY - fh * 0.32 * scaleMultiplier}
               C ${cx + fw * 0.3} ${headTopY - fh * 0.2}, 
                 ${cx + fw * 0.22} ${headTopY - fh * 0.05}, 
                 ${cx + fw * 0.2} ${headTopY + fh * 0.04} Z`}
            fill="url(#devil-grad)"
            stroke="#f87171"
            strokeWidth="0.4"
          />

          {/* Fiery Eyes Accent */}
          <ellipse
            cx={leftEyeX}
            cy={eyesY}
            rx={fw * 0.07 * scaleMultiplier}
            ry={fh * 0.04 * scaleMultiplier}
            fill="#ef4444"
            opacity="0.65"
          />
          <ellipse
            cx={rightEyeX}
            cy={eyesY}
            rx={fw * 0.07 * scaleMultiplier}
            ry={fh * 0.04 * scaleMultiplier}
            fill="#ef4444"
            opacity="0.65"
          />
        </g>
      )}

      {/* ========================================================= */}
      {/* 6. 😇 ANGEL HALO & FLOATING SPARKLES                      */}
      {/* ========================================================= */}
      {filter === 'angel_halo' && (
        <g id="angel-halo-filter" filter="url(#neon-glow-gold)">
          {/* Floating Ring */}
          <ellipse
            cx={cx}
            cy={headTopY - fh * 0.18 * scaleMultiplier}
            rx={fw * 0.38 * scaleMultiplier}
            ry={fh * 0.09 * scaleMultiplier}
            fill="none"
            stroke="url(#gold-halo)"
            strokeWidth="1.4"
            transform={`rotate(-5 ${cx} ${headTopY - fh * 0.18})`}
          />

          {/* Floating Sparkles */}
          <polygon
            points={`${cx - fw * 0.42},${headTopY - fh * 0.3} ${cx - fw * 0.4},${headTopY - fh * 0.27} ${cx - fw * 0.37},${headTopY - fh * 0.3} ${cx - fw * 0.4},${headTopY - fh * 0.33}`}
            fill="#fef08a"
          />
          <polygon
            points={`${cx + fw * 0.42},${headTopY - fh * 0.28} ${cx + fw * 0.44},${headTopY - fh * 0.25} ${cx + fw * 0.47},${headTopY - fh * 0.28} ${cx + fw * 0.44},${headTopY - fh * 0.31}`}
            fill="#fef08a"
          />
          <polygon
            points={`${cx + fw * 0.05},${headTopY - fh * 0.35} ${cx + fw * 0.07},${headTopY - fh * 0.32} ${cx + fw * 0.1},${headTopY - fh * 0.35} ${cx + fw * 0.07},${headTopY - fh * 0.38}`}
            fill="#ffffff"
          />
        </g>
      )}
    </svg>
  );
}
