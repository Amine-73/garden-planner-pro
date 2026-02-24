const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Target your current images folder
const directory = './src/assets/images'; 

fs.readdirSync(directory).forEach(file => {
  if (file.endsWith('.webp')) {
    const filePath = path.join(directory, file);
    const tempPath = path.join(directory, `temp-${file}`);

    sharp(filePath)
      .resize(400) // Shrink width to 400px
      .webp({ quality: 70 }) // Reduce quality to 70%
      .toFile(tempPath)
      .then(() => {
        // Replace the old big file with the new small one
        fs.renameSync(tempPath, filePath);
        console.log(`✅ Compressed: ${file}`);
      })
      .catch(err => console.error(`❌ Error processing ${file}:`, err));
  }
});