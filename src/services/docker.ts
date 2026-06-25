import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'storage');

export async function ensureStorageDir(): Promise<void> {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

export function getStoragePath(jobId: string): string {
  return path.join(STORAGE_DIR, `${jobId}.tar.gz`);
}

export function loadImage(filePath: string): Promise<void> {
  return runShellCommand(`docker load -i ${filePath}`);
}

export async function removeFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore if file doesn't exist
  }
}

export async function listImages(): Promise<any[]> {
  const out = await runShellCommandWithOutput('docker images --format json');
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export async function listContainers(): Promise<any[]> {
  const out = await runShellCommandWithOutput('docker ps -a --format json');
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function runShellCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true });
    let stderr = '';

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

function runShellCommandWithOutput(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true });
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}
