import React from 'react';

/**
 * Authentic official brand icons for WhatsApp, Instagram, Facebook, and Phone Calling.
 */

// 1. OFFICIAL WHATSAPP LOGO
export function WhatsAppIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12.031 2C6.502 2 2.012 6.486 2.012 12.013c0 1.907.534 3.738 1.55 5.334L2 22l4.82-1.528a9.98 9.98 0 0 0 5.211 1.458h.004c5.528 0 10.019-4.487 10.019-10.015 0-2.677-1.043-5.195-2.937-7.089A9.957 9.957 0 0 0 12.031 2zm0 18.324a8.318 8.318 0 0 1-4.244-1.162l-.304-.18-2.859.907.925-2.785-.198-.315a8.307 8.307 0 0 1-1.275-4.476c0-4.593 3.738-8.329 8.334-8.329 2.224 0 4.316.868 5.889 2.441a8.277 8.277 0 0 1 2.438 5.89c0 4.595-3.738 8.33-8.334 8.33zm4.568-6.236c-.25-.125-1.48-.73-1.71-.813-.23-.083-.396-.125-.563.125-.166.25-.646.813-.792.98-.146.166-.292.188-.542.063s-1.057-.39-2.014-1.243c-.744-.664-1.247-1.485-1.393-1.735-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438.125-.146.166-.25.25-.417.083-.166.042-.312-.021-.438s-.563-1.354-.77-1.854c-.203-.487-.41-.421-.563-.429l-.48-.008c-.166 0-.437.063-.666.312-.23.25-.875.854-.875 2.083s.896 2.417 1.021 2.583c.125.166 1.764 2.695 4.275 3.777.597.258 1.064.412 1.428.528.6.191 1.147.164 1.579.1.481-.072 1.48-.604 1.688-1.188.208-.583.208-1.083.146-1.188-.063-.104-.229-.166-.479-.292z" />
    </svg>
  );
}

// 2. OFFICIAL INSTAGRAM LOGO (Classic Camera Contour with Lens and Flash)
export function InstagramIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// 3. OFFICIAL FACEBOOK LOGO
export function FacebookIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// 4. OFFICIAL CALLING / PHONE LOGO
export function CallingIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.053 15.053 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 3.99c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.61c0-.55-.45-1-.99-1z" />
    </svg>
  );
}

// 5. COLOR BRAND BADGES (For rich, colorful badges with authentic official gradients & colors)
export function InstagramBrandBadge({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md hover:scale-105 active:scale-95 transition-transform ${className}`}
    >
      <InstagramIcon className="w-5 h-5 text-white" />
    </div>
  );
}

export function FacebookBrandBadge({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-[#1877F2] text-white shadow-md hover:scale-105 active:scale-95 transition-transform ${className}`}
    >
      <FacebookIcon className="w-5 h-5 text-white" />
    </div>
  );
}

export function WhatsAppBrandBadge({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-[#25D366] text-white shadow-md hover:scale-105 active:scale-95 transition-transform ${className}`}
    >
      <WhatsAppIcon className="w-5 h-5 text-white" />
    </div>
  );
}

export function CallingBrandBadge({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md hover:scale-105 active:scale-95 transition-transform ${className}`}
    >
      <CallingIcon className="w-5 h-5 text-white" />
    </div>
  );
}
