/**
 * Google Drive Media Workflow Handler
 * Converts Google Drive shared view links to direct image streaming URLs with fallback.
 */

import { normalizeGoogleDriveUrl } from '@/lib/utils';

export function parseGoogleDriveUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholders/car-placeholder.jpg';
  const normalized = normalizeGoogleDriveUrl(url);
  return normalized || '/images/placeholders/car-placeholder.jpg';
}

export function isDriveLink(url: string): boolean {
  return url.includes('drive.google.com');
}
