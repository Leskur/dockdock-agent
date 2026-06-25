# DockDock Agent

User-side agent for managing local Docker containers and receiving images from a DockDock server.

## Requirements

- Node.js 18+
- Docker installed and available in PATH

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Agent listens on `http://0.0.0.0:8080` by default.

Open the browser at `http://服务器IP:8080` to use the web UI.

## API

### Deploy an image

```bash
POST /api/v1/deploy
{
  "image": "nginx",
  "tag": "1.25",
  "serverUrl": "http://your-server:3000",
  "serverToken": "optional"
}
```

Response:

```json
{
  "id": "uuid",
  "status": "pending"
}
```

### Check job status

```bash
GET /api/v1/jobs/:id
```

### List local containers

```bash
GET /api/v1/containers
```
