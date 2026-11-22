/**
 * Google Drive Media Workflow Handler
 * Converts Google Drive shared view links to direct image streaming URLs with fallback.
 */

export function parseGoogleDriveUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholders/car-placeholder.jpg';

  // Check if it's a Google Drive link
  if (url.includes('drive.google.com')) {
    // Format 1: drive.google.com/file/d/{FILE_ID}/view...
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1600`;
    }

    // Format 2: drive.google.com/open?id={FILE_ID} or ?id={FILE_ID}
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w1600`;
    }
  }

  // Regular HTTP/HTTPS URL or local path
  return url;
}

export function isDriveLink(url: string): boolean {
  return url.includes('drive.google.com');
}
