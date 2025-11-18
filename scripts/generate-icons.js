/**
 * Script to generate PWA icons in all required sizes
 * Uses sharp library to convert SVG to optimized PNG files
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');
const masterSVG = path.join(iconsDir, 'icon-master.svg');

// Icon sizes to generate
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Favicon sizes
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
];

// Apple touch icon
const appleTouchIcon = { size: 180, name: 'apple-touch-icon.png' };

// Shortcut icons (already in SVG, convert to PNG)
const shortcuts = [
  { svg: 'shortcut-evaluations.svg', png: 'shortcut-evaluations.png', size: 96 },
  { svg: 'shortcut-about.svg', png: 'shortcut-about.png', size: 96 },
  { svg: 'shortcut-contact.svg', png: 'shortcut-contact.png', size: 96 },
];

// Notification icons
const notificationIcons = [
  { svg: 'badge-72x72.svg', png: 'badge-72x72.png', size: 72 },
  { svg: 'action-view.svg', png: 'action-view.png', size: 24 },
  { svg: 'action-close.svg', png: 'action-close.png', size: 24 },
];

async function generateIcon(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 100,
        compressionLevel: 9,
        palette: true
      })
      .toFile(outputPath);

    console.log(`✓ Generated: ${path.basename(outputPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`✗ Error generating ${outputPath}:`, error.message);
  }
}

async function generateAllIcons() {
  console.log('🎨 Starting PWA icon generation...\n');

  // Check if master SVG exists
  if (!fs.existsSync(masterSVG)) {
    console.error('❌ Master SVG not found:', masterSVG);
    process.exit(1);
  }

  console.log('📱 Generating main app icons...');
  for (const { size, name } of iconSizes) {
    const outputPath = path.join(iconsDir, name);
    await generateIcon(masterSVG, outputPath, size);
  }

  console.log('\n🌐 Generating favicons...');
  const faviconSVG = path.join(iconsDir, 'favicon.svg');
  for (const { size, name } of faviconSizes) {
    const outputPath = path.join(iconsDir, name);
    await generateIcon(faviconSVG, outputPath, size);
  }

  console.log('\n🍎 Generating Apple Touch Icon...');
  const applePath = path.join(iconsDir, appleTouchIcon.name);
  await generateIcon(masterSVG, applePath, appleTouchIcon.size);

  console.log('\n🔗 Generating shortcut icons...');
  for (const { svg, png, size } of shortcuts) {
    const inputPath = path.join(iconsDir, svg);
    const outputPath = path.join(iconsDir, png);
    if (fs.existsSync(inputPath)) {
      await generateIcon(inputPath, outputPath, size);
    }
  }

  console.log('\n🔔 Generating notification icons...');
  for (const { svg, png, size } of notificationIcons) {
    const inputPath = path.join(iconsDir, svg);
    const outputPath = path.join(iconsDir, png);
    if (fs.existsSync(inputPath)) {
      await generateIcon(inputPath, outputPath, size);
    }
  }

  // Copy favicon.ico
  console.log('\n📋 Creating favicon.ico...');
  const favicon32 = path.join(iconsDir, 'favicon-32x32.png');
  const faviconIco = path.join(__dirname, '../public/favicon.ico');
  if (fs.existsSync(favicon32)) {
    fs.copyFileSync(favicon32, faviconIco);
    console.log('✓ favicon.ico created');
  }

  console.log('\n✅ All icons generated successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Main icons: ${iconSizes.length}`);
  console.log(`   - Favicons: ${faviconSizes.length}`);
  console.log(`   - Apple icon: 1`);
  console.log(`   - Shortcuts: ${shortcuts.length}`);
  console.log(`   - Notifications: ${notificationIcons.length}`);
  console.log(`   - Total: ${iconSizes.length + faviconSizes.length + shortcuts.length + notificationIcons.length + 1}`);
}

// Run the generator
generateAllIcons().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
