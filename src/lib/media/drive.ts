/**
 * Google Drive Media Workflow Handler
 * Converts Google Drive shared view links to direct image streaming URLs with fallback.
 */

export function parseGoogleDriveUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholders/car-placeholder.jpg';

  const trimmed = url.trim();

  // Check if it's already a direct Google CDN link
  if (trimmed.includes('googleusercontent.com')) {
    return trimmed;
  }

  // Check if it's a Google Drive link
  if (trimmed.includes('drive.google.com')) {
    // Format 1: drive.google.com/file/d/{FILE_ID}/view...
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }

    // Format 2: drive.google.com/open?id={FILE_ID} or ?id={FILE_ID}
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }
  }

  // Regular HTTP/HTTPS URL or local path
  return trimmed;
}

export function isDriveLink(url: string): boolean {
  return url.includes('drive.google.com');
}
