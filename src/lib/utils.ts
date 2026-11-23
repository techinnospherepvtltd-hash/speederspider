import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyAED(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string, locale: string = 'en-US'): string {
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Automatically converts Google Drive share URLs into direct, high-speed CDN image URLs.
 * Supports:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/file/d/{FILE_ID}/view
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 * - https://drive.google.com/d/{FILE_ID}
 * - Raw Google Drive File IDs (25-50 characters)
 * Output: https://lh3.googleusercontent.com/d/{FILE_ID}
 */
export function normalizeGoogleDriveUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. Direct raw Google Drive file ID (alphanumeric, underscores, hyphens, 25-55 chars)
  if (/^[a-zA-Z0-9_-]{25,55}$/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${trimmed}`;
  }

  // 2. Match /d/{FILE_ID} or /file/d/{FILE_ID} or /u/{num}/d/{FILE_ID} pattern
  const fileDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,55})/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // 3. Match id={FILE_ID} query parameter pattern
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,55})/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return trimmed;
}
