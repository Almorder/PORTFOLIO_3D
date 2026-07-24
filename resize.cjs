const sharp = require('sharp');
const fs = require('fs');

async function resizeImages() {
  const assets = [
    { name: 'asset-1.png', width: 144, height: 144 },
    { name: 'asset-2.png', width: 300, height: 60 },
    { name: 'asset-3.png', width: 144, height: 144 },
    { name: 'asset-4.png', width: 112, height: 112 }
  ];

  for (const asset of assets) {
    const path = `public/assets/${asset.name}`;
    if (fs.existsSync(path)) {
      const buffer = fs.readFileSync(path);
      await sharp(buffer)
        .resize(asset.width, asset.height, { fit: 'inside' })
        .toFile(path);
      console.log(`Resized ${asset.name}`);
    } else {
      console.log(`File not found: ${path}`);
    }
  }
}

resizeImages();
