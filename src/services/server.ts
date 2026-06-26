import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import fs from 'fs';

const SERVER_URL = 'https://dockdock.baiduapi.com';

export async function requestDownload(
  image: string,
  tag: string,
  token?: string
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${SERVER_URL}/images/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ image, tag }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data as { id: string; status: string };
}

export async function getServerStatus(
  serverJobId: string,
  token?: string
): Promise<{ id: string; image: string; tag: string; status: string; progress: number; error?: string; createdAt: number; updatedAt: number }> {
  const res = await fetch(`${SERVER_URL}/images/jobs/${serverJobId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server status returned ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data as { id: string; image: string; tag: string; status: string; progress: number; error?: string; createdAt: number; updatedAt: number };
}

export async function downloadFile(
  serverJobId: string,
  filePath: string,
  token?: string
): Promise<void> {
  const res = await fetch(`${SERVER_URL}/images/jobs/${serverJobId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Download returned ${res.status}: ${text}`);
  }

  if (!res.body) {
    throw new Error('No response body');
  }

  const fileStream = fs.createWriteStream(filePath);
  await pipeline(Readable.fromWeb(res.body as any), fileStream);
}

export async function searchImages(query: string): Promise<any> {
  const res = await fetch(`${SERVER_URL}/images/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listTags(namespace: string, repo: string, name?: string): Promise<any> {
  const params = new URLSearchParams();
  if (name && name.trim()) {
    params.set('name', name.trim());
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${SERVER_URL}/images/${encodeURIComponent(namespace)}/${encodeURIComponent(repo)}/tags${queryString}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tags failed: ${res.status} ${text}`);
  }
  return res.json();
}
