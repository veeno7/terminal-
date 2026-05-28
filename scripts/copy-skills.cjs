// Copies all manifest.json files from src/skills to dist/skills after tsc build
const fs = require('fs');
const path = require('path');

function copyManifests(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyManifests(srcPath, destPath);
    } else if (entry.name === 'manifest.json') {
      fs.copyFileSync(srcPath, destPath);
      console.log(`[copy-skills] Copied: ${srcPath} → ${destPath}`);
    }
  }
}

const src = path.resolve(__dirname, '..', 'src', 'skills');
const dest = path.resolve(__dirname, '..', 'dist', 'skills');
copyManifests(src, dest);
console.log('[copy-skills] Done.');
