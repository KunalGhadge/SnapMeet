import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { ClientBootstrapper } from '@/components/ClientBootstrapper';

export const metadata: Metadata = {
  title: {
    default: 'Snap Meet | Real-time WebRTC Video Calls with AR Face Effects',
    template: '%s',
  },
  description:
    'Snap Meet is a real-time WebRTC video calling application featuring Snapchat-style AR face effects, facial warps, and synchronized multi-user interactions.',
  twitter: {
    card: 'summary_large_image',
  },
  openGraph: {
    url: 'https://github.com/KunalGhadge/SnapMeet',
    siteName: 'Snap Meet',
  },
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      {
        rel: 'apple-touch-icon',
        url: '/images/snap-meet-icon.svg',
        sizes: '180x180',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-lk-theme="default">
        <ClientBootstrapper />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
