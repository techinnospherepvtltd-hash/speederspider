import { NextRequest, NextResponse } from 'next/server';
import { getGoogleReviewSettings, updateGoogleReviewSettings } from '@/lib/data/db';

export async function GET() {
  try {
    const googleReviews = await getGoogleReviewSettings();
    return NextResponse.json({ success: true, googleReviews });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.googleReviews) {
      await updateGoogleReviewSettings(body.googleReviews);
    }
    const updated = await getGoogleReviewSettings();
    return NextResponse.json({ success: true, googleReviews: updated });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}
