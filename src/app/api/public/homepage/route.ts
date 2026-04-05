import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';

export const revalidate = 60; // 1 minute cache globally

type UploadValue = { url?: string; alt?: string; mimeType?: string } | null | undefined;
type CmsRecord = Record<string, unknown>;

function asRecord(value: unknown) {
  return typeof value === 'object' && value ? (value as CmsRecord) : {};
}

function processMedia(value: unknown) {
  if (typeof value === 'object' && value && 'url' in (value as Record<string, unknown>)) {
    const upload = value as UploadValue;
    return upload?.url
      ? {
          url: upload.url,
          alt: upload.alt,
          mimeType: upload.mimeType,
        }
      : null;
  }
  return null;
}

export async function GET() {
  try {
    const payload = await getPayloadClient();
    const homepage = await payload.findGlobal({ slug: 'homepage', depth: 2 });
    
    if (!homepage) {
      return NextResponse.json({ error: 'Homepage not found' }, { status: 404 });
    }

    const record = asRecord(homepage);
    
    // Return strictly the blocks-based layout model
    const layout = Array.isArray(record.layout) ? record.layout : [];
    
    return NextResponse.json({
      layout: layout.map((block: any) => {
        // Here we could sanitize internal fields if needed, or pass-through
        return block;
      }),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('Homepage API error:', error);
    return NextResponse.json({ error: 'Failed to fetch homepage data' }, { status: 500 });
  }
}
