import { chmod, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distElectronDir = path.join(projectRoot, 'dist-electron');
const envFiles = ['.env.development', '.env.production'];

async function ensureDistElectron() {
  await mkdir(distElectronDir, { recursive: true });
}

async function copyEnvFiles() {
  await ensureDistElectron();

  const copied = [];

  for (const filename of envFiles) {
    const sourcePath = path.join(projectRoot, filename);
    if (!existsSync(sourcePath)) {
      continue;
    }

    const targetPath = path.join(distElectronDir, filename);
    await copyFile(sourcePath, targetPath);

    if (os.platform() !== 'win32') {
      await chmod(targetPath, 0o600);
    }

    copied.push(filename);
  }

  const message = copied.length
    ? `Copied env files into dist-electron: ${copied.join(', ')}`
    : 'No env files were copied because none were found at the project root.';

  console.log(message);
}

await copyEnvFiles().catch((error) => {
  console.error('Failed to copy env files:', error);
  process.exitCode = 1;
});
