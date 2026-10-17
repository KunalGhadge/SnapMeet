# Snap Meet

> Real-Time WebRTC Video Conferencing with Official Snap Camera Kit AR Lenses

Snap Meet elevates standard video calls into an interactive, high-performance conferencing experience. Built with Next.js 15, LiveKit Cloud WebRTC, and the official Snap Camera Kit Web SDK, Snap Meet delivers uninterrupted 60fps video with real-time AR lenses and dynamic facial tracking synchronized across participants.

---

## Features

### Official Snap Camera Kit AR Lenses
- **Official Snap Lenses**: Powered directly by `@snap/camera-kit` connecting to your configured Snap Lens Group.
- **Dynamic Aspect Ratio & Zero Distortion**: Internal render resolution dynamically synchronizes with conference tile containers to prevent zoom distortion and cropping.
- **Instant Lens Switching**: Smart media source caching connects WebRTC camera tracks without redundant detachment cycles.
- **Seamless Failure Fallback**: Graceful error handling ensures camera playback never freezes or goes black.

### Multi-User Synchronized Controls
- **Target Remote Participants**: Apply lenses to your own camera preview or trigger effects on friends' video tiles.
- **Instant WebRTC Data Synchronization**: Filter selections synchronize across peers in milliseconds via WebRTC Data Channels.
- **Active Lens Badges**: Every video tile displays a badge showing the active lens with one-click reset controls.

### 60FPS Hardware Accelerated Video
- **VP8 Hardware Codec**: Optimized for ultra-low latency and low CPU utilization across multi-window conferences.
- **Adaptive Streaming & Dynacast**: LiveKit dynacast and adaptive streaming optimize network bandwidth and frame delivery.
- **Continuous Frame Delivery**: WebRTC streams remain active and fluid across split screens and multi-monitor setups.

### Modern UI & Pixel Art Visuals
- High-contrast dark theme with glassmorphic elements and clean vector icons (zero emojis).
- Interactive Pixel Snow background on the landing page with physics and depth.
- Fully responsive layout for desktop, tablet, and mobile browsers.

### Enterprise Security
- Optional End-to-End Encryption (E2EE) powered by Web Workers.
- Secure token-based room authorization.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 18)
- **Language**: TypeScript 5
- **WebRTC & Real-time Media**: LiveKit Client SDK (`livekit-client`, `@livekit/components-react`, `livekit-server-sdk`)
- **AR Engine**: Snap Camera Kit Web SDK (`@snap/camera-kit`)
- **Styling**: Vanilla CSS Modules with glassmorphism design tokens
- **Testing**: Vitest

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/) package manager
- A free [LiveKit Cloud](https://cloud.livekit.io/) account
- A [Snap Camera Kit](https://camera-kit.snap.com/) developer account

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
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret

   NEXT_PUBLIC_SNAP_CAMERA_KIT_API_TOKEN=your_camera_kit_api_token
   NEXT_PUBLIC_SNAP_CAMERA_KIT_LENS_GROUP_ID=your_lens_group_id
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

## Deployment on Vercel

Follow these steps to deploy Snap Meet to Vercel:

### Step 1: Push Code to GitHub
Ensure all code is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Snap Meet with Snap Camera Kit"
git push origin main
```

### Step 2: Import Project in Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Select your GitHub repository (`KunalGhadge/SnapMeet`).
4. Select **Next.js** as the Framework Preset (automatically detected).
5. Leave the Root Directory as `./`.

### Step 3: Add Environment Variables
In the Vercel project configuration page under **Environment Variables**, add the following 5 variables:

| Variable Name | Description | Example |
|---|---|---|
| `LIVEKIT_URL` | LiveKit Cloud WebSocket URL | `wss://snap-meet-xxxx.livekit.cloud` |
| `LIVEKIT_API_KEY` | LiveKit Cloud API Key | `APIxxxxxxxx` |
| `LIVEKIT_API_SECRET` | LiveKit Cloud API Secret | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_SNAP_CAMERA_KIT_API_TOKEN` | Snap Camera Kit API Token | `ey...` |
| `NEXT_PUBLIC_SNAP_CAMERA_KIT_LENS_GROUP_ID` | Snap Camera Kit Lens Group UUID | `d01892b6-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

> Important: Ensure `NEXT_PUBLIC_SNAP_CAMERA_KIT_API_TOKEN` and `NEXT_PUBLIC_SNAP_CAMERA_KIT_LENS_GROUP_ID` are prefixed with `NEXT_PUBLIC_` so they are available in browser client components.

### Step 4: Deploy
Click **Deploy**. Vercel will build the Next.js application and deploy it to a global edge network.

---

## Project Structure

```text
├── app/
│   ├── api/
│   │   └── connection-details/    # LiveKit token generation endpoint
│   ├── rooms/[roomName]/          # Main conference room view & client logic
│   ├── layout.tsx                 # Root layout with Snap Meet metadata & icons
│   └── page.tsx                   # Landing page (Start/Join call, PixelSnow)
├── lib/
│   ├── camerakit/
│   │   ├── cameraKitService.ts    # Camera Kit singleton session & dynamic sizing
│   │   └── suppressWasmWarnings.ts# Clean WebAssembly warning suppressor
│   ├── filters/
│   │   ├── FilterPanel.tsx        # Snap Lens drawer tray with target selector
│   │   └── RemoteFunnyVideoTile.tsx# Camera Kit canvas renderer & aspect ratio sync
│   ├── PixelSnow.tsx              # Interactive pixel-art snowflake background
│   ├── FunnyControlBar.tsx        # Conference control bar with Effects trigger
│   └── FunnyVideoConference.tsx   # Video conference layout & WebRTC synchronization
├── styles/
│   ├── globals.css                # Base design tokens and resets
│   ├── Home.module.css            # Landing page layout and responsive styles
│   └── funnyFilters.css           # Lens drawer, pucks, and badge styles
└── public/
    ├── favicon.svg                # Snap Meet vector favicon
    └── images/                    # Brand assets and logos
```

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
