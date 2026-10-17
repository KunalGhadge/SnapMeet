import * as React from 'react';
import type { Metadata } from 'next';
import { PageClientImpl } from './PageClientImpl';
import { isVideoCodec } from '@/lib/types';
import { getLiveKitURL } from '@/lib/getLiveKitURL';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomName: string }>;
}): Promise<Metadata> {
  const { roomName } = await params;
  return {
    title: `Snap Meet | ${roomName}`,
    description: `Join room ${roomName} on Snap Meet with real-time AR face effects.`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ roomName: string }>;
  searchParams: Promise<{
    // FIXME: We should not allow values for regions if in playground mode.
    region?: string;
    hq?: string;
    codec?: string;
    singlePC?: string;
  }>;
}) {
  const _params = await params;
  const _searchParams = await searchParams;
  const codec =
    typeof _searchParams.codec === 'string' && isVideoCodec(_searchParams.codec)
      ? _searchParams.codec
      : 'vp8';
  const hq = _searchParams.hq === 'true' ? true : false;
  const singlePC = _searchParams.singlePC !== 'false';
  const serverUrl = process.env.LIVEKIT_URL
    ? getLiveKitURL(process.env.LIVEKIT_URL, _searchParams.region ?? null)
    : undefined;

  return (
    <PageClientImpl
      roomName={_params.roomName}
      serverUrl={serverUrl}
      region={_searchParams.region}
      hq={hq}
      codec={codec}
      singlePeerConnection={singlePC}
    />
  );
}
