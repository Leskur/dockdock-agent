export type LocalJobStatus =
  | 'pending'
  | 'requesting'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'failed';

export interface LocalJob {
  id: string;
  image: string;
  tag: string;
  serverUrl: string;
  serverToken?: string;
  status: LocalJobStatus;
  progress: number;
  serverJobId?: string;
  filePath?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}
