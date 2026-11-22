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
 * Example input:  https://drive.google.com/file/d/1d8Lnri1HNvfNGWpLY8b0tOKKr8lwFsMx/view?usp=sharing
 * Example output: https://lh3.googleusercontent.com/d/1d8Lnri1HNvfNGWpLY8b0tOKKr8lwFsMx
 */
export function normalizeGoogleDriveUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Match /file/d/{FILE_ID} pattern
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Match id={FILE_ID} query parameter pattern
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return trimmed;
}
