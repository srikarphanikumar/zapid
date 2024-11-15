import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const LIMIT = {
    CJS: 5 * 1024, // 5KB
    ESM: 5 * 1024, // 5KB
    GZIP: 2 * 1024  // 2KB
};

function formatSize(bytes: number): string {
    return `${(bytes / 1024).toFixed(2)} KB`;
}

function checkFile(filePath: string, label: string, sizeLimit: number) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${label} file not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath);
    const gzipped = zlib.gzipSync(content);

    console.log(`\n📦 ${label}:`);
    console.log(`Raw Size: ${formatSize(content.length)}`);
    console.log(`Gzipped: ${formatSize(gzipped.length)}`);

    if (content.length > sizeLimit) {
        console.log(`⚠️  Exceeds size limit of ${formatSize(sizeLimit)}`);
    } else {
        console.log(`✅ Within size limit`);
    }
}

console.log('=== Bundle Size Analysis ===');

checkFile('dist/index.js', 'CommonJS', LIMIT.CJS);
checkFile('dist/index.mjs', 'ESM', LIMIT.ESM);

// Check total dist folder size
const distSize = fs.readdirSync('dist')
    .map(file => fs.statSync(path.join('dist', file)).size)
    .reduce((a, b) => a + b, 0);

console.log(`\n📂 Total dist size: ${formatSize(distSize)}`);