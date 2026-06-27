import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const source = readFileSync(join(publicDir, 'pwa-icon.svg'));

const sizes = [
  { name: 'pwa-192.png', size: 192 },
  { name: 'pwa-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-maskable-512.png', size: 512, maskable: true },
];

for (const { name, size, maskable } of sizes) {
  let pipeline = sharp(source).resize(size, size);
  if (maskable) {
    pipeline = pipeline.extend({
      top: Math.round(size * 0.1),
      bottom: Math.round(size * 0.1),
      left: Math.round(size * 0.1),
      right: Math.round(size * 0.1),
      background: '#0D1B2A',
    });
  }
  await pipeline.png().toFile(join(publicDir, name));
  console.log(`Created ${name}`);
}
