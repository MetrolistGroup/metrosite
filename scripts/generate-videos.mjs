import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve('public/images/screenshots/wbw_lyrics_showcase.mp4');

if (!fs.existsSync(source)) {
  console.error(`Source video not found: ${source}`);
  process.exit(1);
}

const variants = [
  {
    name: 'low',
    output: path.resolve('public/images/screenshots/wbw_lyrics_showcase_low.mp4'),
    args: [
      '-i', source,
      '-vf', 'scale=540:1170:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'medium',
      '-crf', '28', '-b:v', '500k', '-maxrate', '700k', '-bufsize', '1000k',
      '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p',
      '-an', '-movflags', '+faststart',
      '-y'
    ]
  },
  {
    name: 'med',
    output: path.resolve('public/images/screenshots/wbw_lyrics_showcase_med.mp4'),
    args: [
      '-i', source,
      '-vf', 'scale=720:1560:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'medium',
      '-crf', '26', '-b:v', '1500k', '-maxrate', '2000k', '-bufsize', '3000k',
      '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p',
      '-an', '-movflags', '+faststart',
      '-y'
    ]
  }
];

function runFfmpeg(variant) {
  return new Promise((resolve, reject) => {
    const args = [...variant.args, variant.output];
    const child = execFile('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
    child.stderr.on('data', (chunk) => {
      process.stderr.write(`[${variant.name}] ${chunk}`);
    });
  });
}

async function main() {
  for (const variant of variants) {
    console.log(`Encoding ${variant.name} -> ${variant.output}`);
    try {
      await runFfmpeg(variant);
    } catch (error) {
      console.error(`ffmpeg failed for ${variant.name}: ${error.message}`);
      process.exit(1);
    }
    const { size } = fs.statSync(variant.output);
    console.log(`${variant.name}: ${path.basename(variant.output)} (${(size / 1024 / 1024).toFixed(2)} MB)`);
  }
}

main();
