const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(srcDir);
let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace font-serif with font-sans
  if (content.includes('font-serif')) {
    content = content.replace(/font-serif/g, 'font-sans');
    changed = true;
    totalReplacements++;
  }

  // Replace font-mono with font-sans
  if (content.includes('font-mono')) {
    content = content.replace(/font-mono/g, 'font-sans');
    changed = true;
    totalReplacements++;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.relative(__dirname, file)}`);
  }
});

console.log(`Done! Total updated files: ${totalReplacements}`);
