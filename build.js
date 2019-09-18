const JSZip = require('node-zip');
const fs = require('fs');

const FILES = [
  'manifest.json',
  'background.js',
  'images/16_u.png',
  'images/48_u.png',
  'images/128_u.png',
  'images/16_m.png',
  'images/48_m.png',
  'images/128_m.png',
  'images/16_u_white.png',
  'images/48_u_white.png',
  'images/128_u_white.png',
  'images/16_m_white.png',
  'images/48_m_white.png',
  'images/128_m_white.png'
];

function run() {
  try {
    console.log('🔥 starting build...');
    if (!fs.existsSync('build')) {
      fs.mkdirSync('build');
    }
    const zip = new JSZip();
    for (const file of FILES) {
      zip.file(file, fs.readFileSync(file));
    }
    const data = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync('build/chrome-tab-mute.zip', data);
    console.log('🚀 build finished');
  } catch (error) {
    console.error(error.message);
  }
}

run();
