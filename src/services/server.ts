import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import fs from 'fs';

export async function requestDownload(
  serverUrl: string,
  image: string,
  tag: string,
  token?: string
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${serverUrl}/api/v1/images/download`, {
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
  serverUrl: string,
  serverJobId: string,
  token?: string
): Promise<{ status: string; error?: string }> {
  const res = await fetch(`${serverUrl}/api/v1/images/download/${serverJobId}/status`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server status returned ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data as { status: string; error?: string };
}

export async function downloadFile(
  serverUrl: string,
  serverJobId: string,
  filePath: string,
  token?: string
): Promise<void> {
  const res = await fetch(`${serverUrl}/api/v1/images/download/${serverJobId}/file`, {
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
