# Snap Meet 📸✨

> **Real-Time WebRTC Video Conferencing with Snapchat-Style AR Effects & Facial Warps**

Snap Meet elevates standard video calls into an interactive, fun, and high-performance conferencing experience. Built with Next.js, LiveKit Cloud WebRTC, and GPU-accelerated WebGL shaders, Snap Meet delivers uninterrupted 60fps video with real-time AR face accessories and dynamic facial deformations synchronized across all participants.

---

## 🌟 Key Features

### 🎭 15 Real-Time Face Filters & AR Effects
- **Snapchat AR Props**:
  - 🐶 **Puppy Dog**: Fluffy animated floppy ears, pink tongue, and cute nose.
  - 🐱 **Kitty Cat**: Pointy inner-pink cat ears, twitching whiskers, and button nose.
  - 😎 **Thug Life**: Iconic 8-bit pixel sunglasses, gold chain, and spinning smoke.
  - 🥸 **Disguise**: Classic Groucho Marx bushy eyebrows, spectacles, and mustache.
  - 😈 **Devil Horns**: Fiery curved demon horns with a radiant crimson aura.
  - 😇 **Angel Halo**: Floating golden angelic halo with particle glow.
- **GPU Facial Warps**:
  - 👽 **Big Head**: Exaggerates head size while preserving eye clarity.
  - 🤏 **Tiny Face**: Pinches facial features into a comedic miniature cluster.
  - 👽 **Alien**: Stretches forehead and slims chin for an extraterrestrial look.
  - 🗿 **Mega Chin**: Chiseled gigachad jawline distortion.
  - 🌀 **Hypnotic Swirl**: Swirling vortex centered on facial coordinates.
  - 🌊 **Jelly Wiggle**: Sine-wave liquid ripple across the video frame.
  - 👁️ **Cyclops**: Merges eyes into a single giant center eye.
  - 🎲 **Chaos Random**: Automatically cycles deformations for maximum fun.

### 👥 Multi-User Synchronized Controls
- **Target Anyone in the Room**: Apply filters to your own camera or surprise friends in the meeting by triggering filters on their video tiles.
- **Instant WebRTC Data Synchronization**: Filter selections and intensity adjustments synchronize across all peers in milliseconds via WebRTC Data Channels.
- **Tile Effect Badges**: Every video tile displays a glassmorphic badge showing the active effect and offering one-click filter configuration.

### ⚡ Resilient 60FPS Video Streaming
- **Continuous Frame Delivery**: Stream options configured to prevent server-side downsampling or freezing when tabs are unfocused or split-screened.
- **Zero-Block Hardware Decoding**: Native WebRTC video streams decode directly on hardware while AR overlays and WebGL shaders run decoupled, guaranteeing fluid frame rates.
- **Multi-Window Stability**: Reliable playback across split screens, multiple monitors, and multi-user conference grids.

### 🎨 Modern Glassmorphic UI
- Designed with high-contrast sleek dark aesthetics, subtle gradients, and micro-animations.
- Categorized drawer tabs (*Snapchat AR*, *Facial Warps*, *Normal*) for effortless effect browsing.
- Adaptive responsive layout that scales gracefully from ultra-wide monitors down to mobile devices.

### 🔒 Enterprise-Grade Security
- Optional End-to-End Encryption (E2EE) powered by Web Workers.
- Secure token-based room authorization.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack / Webpack)
- **Language**: TypeScript 5
- **WebRTC & Real-time Media**: LiveKit Client SDK (`livekit-client`, `@livekit/components-react`)
- **Graphics & AR**: WebGL 2.0 Fragment Shaders, Offscreen Canvas, Chromium Native FaceDetector API
- **Styling**: Vanilla CSS with CSS Custom Properties and glassmorphic blur effects
- **Testing**: Vitest

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/) package manager
- A free [LiveKit Cloud](https://cloud.livekit.io/) account or self-hosted LiveKit Server

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KunalGhadge/SnapMeet.git
   cd SnapMeet
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret
   LIVEKIT_URL=https://your-project.livekit.cloud
   NEXT_PUBLIC_LK_TOKEN_ENDPOINT=/api/token
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run test suite**:
   ```bash
   pnpm test
   ```

---

## 📁 Project Structure

```text
├── app/
│   ├── custom/                # Custom room connection implementations
│   ├── rooms/[roomName]/      # Main conference room view & client logic
│   ├── layout.tsx             # Root layout with Snap Meet metadata
│   └── page.tsx               # Landing page (Start/Join call)
├── lib/
│   ├── filters/
│   │   ├── ARFaceOverlay.tsx         # Snapchat AR props (Puppy, Cat, Thug Life, etc.)
│   │   ├── faceDeformationRenderer.ts# WebGL vertex/fragment warp shaders
│   │   ├── faceTracker.ts            # Non-blocking face tracking engine
│   │   ├── FilterPanel.tsx           # Categorized filter selector drawer
│   │   └── RemoteFunnyVideoTile.tsx  # Resilient video tile with AR overlay
│   ├── FunnyControlBar.tsx    # Conference control bar with Effects trigger
│   └── FunnyVideoConference.tsx# Video conference layout & WebRTC synchronization
├── styles/
│   ├── globals.css            # Base design tokens and resets
│   └── funnyFilters.css       # Filter panel and badge glassmorphism styles
└── public/
    └── images/                # Snap Meet brand assets and icons
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for new features, additional AR filters, or performance enhancements.

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
