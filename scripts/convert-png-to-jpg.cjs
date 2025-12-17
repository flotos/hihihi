const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

async function convertPngToJpg() {
  const files = fs.readdirSync(publicDir);
  const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));

  if (pngFiles.length === 0) {
    console.log('No PNG files found in public folder.');
    return;
  }

  console.log(`Found ${pngFiles.length} PNG file(s) to convert.`);

  for (const pngFile of pngFiles) {
    const pngPath = path.join(publicDir, pngFile);
    const jpgFile = pngFile.replace(/\.png$/i, '.jpg');
    const jpgPath = path.join(publicDir, jpgFile);

    try {
      await sharp(pngPath)
        .jpeg({ quality: 90 })
        .toFile(jpgPath);

      fs.unlinkSync(pngPath);
      console.log(`Converted: ${pngFile} -> ${jpgFile}`);
    } catch (error) {
      console.error(`Error converting ${pngFile}:`, error.message);
    }
  }

  console.log('Conversion complete!');
}

convertPngToJpg();
