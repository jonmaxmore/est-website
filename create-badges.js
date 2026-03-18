const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dst = path.join(__dirname, 'public/images');
const srcDir = 'C:/Users/USER/Downloads';

async function main() {
  // Resize App Store badge to match Google Play dimensions (564x168)
  const svgBuf = fs.readFileSync(path.join(srcDir, 'ios-pre-btn.svg'));
  const info = await sharp(svgBuf)
    .resize(564, 168, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(dst, 'badge-app-store.webp'));
  console.log(`badge-app-store.webp: ${info.width}x${info.height} — ${info.size} bytes`);
  console.log('Done!');
}

main().catch(e => console.error('Error:', e));
