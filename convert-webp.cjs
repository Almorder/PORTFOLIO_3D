const sharp = require('sharp');
const fs = require('fs');

async function convertToWebP() {
  const assets = [
    { src: 'asset-1.png', dest: 'asset-1.webp', width: 72, height: 72 },
    { src: 'asset-2.png', dest: 'asset-2.webp', width: 150, height: 30 },
    { src: 'asset-3.png', dest: 'asset-3.webp', width: 72, height: 72 },
    { src: 'asset-4.png', dest: 'asset-4.webp', width: 56, height: 56 }
  ];

  for (const asset of assets) {
    const srcPath = `public/assets/${asset.src}`;
    const destPath = `public/assets/${asset.dest}`;
    if (fs.existsSync(srcPath)) {
      try {
        await sharp(srcPath)
          .resize(asset.width, asset.height, { fit: 'inside' })
          .webp({ quality: 80 })
          .toFile(destPath);
        console.log(`Converted ${asset.src} to ${asset.dest}`);
      } catch(e) {
        console.error(`Failed ${asset.src}:`, e);
      }
    }
  }
}

convertToWebP();
