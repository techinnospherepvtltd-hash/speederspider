const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/images/speederspider-logo.jpg');
  const img = sharp(inputPath);
  const meta = await img.metadata();
  console.log('Original image:', meta.width, 'x', meta.height);

  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Let's create high quality WebP of the full logo
  await sharp(inputPath)
    .webp({ quality: 95 })
    .toFile(path.join(__dirname, '../public/images/speederspider-logo.webp'));
  console.log('Created speederspider-logo.webp');

  // Let's create high quality PNG of the full logo
  await sharp(inputPath)
    .png({ compressionLevel: 9 })
    .toFile(path.join(__dirname, '../public/images/speederspider-logo.png'));
  console.log('Created speederspider-logo.png');

  // Let's analyze bounding box of the whole logo content
  // Background is approx R:0, G:3, B:23
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luminance > 22 || r > 18 || g > 25 || b > 45) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Content bounding box: x=[${minX}, ${maxX}] y=[${minY}, ${maxY}]`);
  console.log(`Content size: ${maxX - minX + 1} x ${maxY - minY + 1}`);

  // Create a trimmed/cropped version with subtle balanced padding
  const padX = 24;
  const padY = 20;
  const cropX = Math.max(0, minX - padX);
  const cropY = Math.max(0, minY - padY);
  const cropW = Math.min(w - cropX, (maxX - minX + 1) + padX * 2);
  const cropH = Math.min(h - cropY, (maxY - minY + 1) + padY * 2);

  await sharp(inputPath)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .webp({ quality: 95 })
    .toFile(path.join(__dirname, '../public/images/speederspider-logo-tight.webp'));
  console.log('Created speederspider-logo-tight.webp');

  // Shield Emblem (top section without text)
  // Let's find shield content boundaries
  let shieldMinX = w, shieldMaxX = 0, shieldMinY = minY, shieldMaxY = 485;
  for (let y = minY; y <= 485; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 22 || r > 18 || g > 25 || b > 45) {
        if (x < shieldMinX) shieldMinX = x;
        if (x > shieldMaxX) shieldMaxX = x;
      }
    }
  }

  // Create square emblem centered on shield
  const shieldCenterX = Math.round((shieldMinX + shieldMaxX) / 2);
  const shieldCenterY = Math.round((shieldMinY + shieldMaxY) / 2);
  const shieldSpan = Math.max(shieldMaxX - shieldMinX, shieldMaxY - shieldMinY) + 30;
  const emblemSize = Math.min(Math.min(w, h), Math.round(shieldSpan));
  const emblemLeft = Math.max(0, Math.min(w - emblemSize, Math.round(shieldCenterX - emblemSize / 2)));
  const emblemTop = Math.max(0, Math.min(h - emblemSize, Math.round(shieldCenterY - emblemSize / 2)));

  console.log(`Shield crop: size=${emblemSize}, left=${emblemLeft}, top=${emblemTop}`);

  // Create emblem square
  await sharp(inputPath)
    .extract({ left: emblemLeft, top: emblemTop, width: emblemSize, height: emblemSize })
    .resize(512, 512)
    .webp({ quality: 95 })
    .toFile(path.join(__dirname, '../public/images/speederspider-emblem.webp'));

  await sharp(inputPath)
    .extract({ left: emblemLeft, top: emblemTop, width: emblemSize, height: emblemSize })
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/images/speederspider-emblem.png'));
  console.log('Created speederspider-emblem.webp and png (512x512)');

  // Also create a whole-crest square (including the bottom V-tip and text)
  // for icon.png and favicon
  const fullCenterY = Math.round((minY + maxY) / 2);
  const fullSpan = Math.max(maxX - minX + 1, maxY - minY + 1) + 40;
  const fullSize = Math.min(w, Math.round(fullSpan));
  const fullLeft = Math.max(0, Math.min(w - fullSize, Math.round(w / 2 - fullSize / 2)));
  const fullTop = Math.max(0, Math.min(h - fullSize, Math.round(fullCenterY - fullSize / 2)));

  // Generate favicon / app icon (192x192 and 512x512 for PWA & browser tab)
  await sharp(inputPath)
    .extract({ left: emblemLeft, top: emblemTop, width: emblemSize, height: emblemSize })
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../src/app/icon.png'));

  await sharp(inputPath)
    .extract({ left: emblemLeft, top: emblemTop, width: emblemSize, height: emblemSize })
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../src/app/apple-icon.png'));

  // Also create public/favicon.ico (standard 32x32 PNG)
  await sharp(inputPath)
    .extract({ left: emblemLeft, top: emblemTop, width: emblemSize, height: emblemSize })
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.ico'));

  console.log('Created src/app/icon.png, src/app/apple-icon.png, and public/favicon.ico');
}

processLogo().catch(console.error);
