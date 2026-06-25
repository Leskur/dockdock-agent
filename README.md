# DockDock Agent

User-side agent for managing local Docker containers and receiving images from a DockDock server.

## Requirements

- Node.js 18+
- Docker installed and available in PATH

## Install

```bash
npm install
cp .env.example .env
```

Edit `.env` to adjust the default Server URL, port, and host if needed.

## Run

```bash
npm run dev
```

Agent listens on `http://0.0.0.0:8910` by default.

Open the browser at `http://服务器IP:8910` to use the web UI.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8910` | Agent listening port |
| `HOST` | `0.0.0.0` | Agent listening host |
| `DEFAULT_SERVER_URL` | `https://dockdock.baiduapi.com` | Default Server URL shown in the web UI |

## API

### Deploy an image

```bash
POST /api/v1/deploy
{
  "image": "nginx",
  "tag": "1.25",
  "serverUrl": "https://dockdock.baiduapi.com",
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

### List all jobs

```bash
GET /api/v1/jobs
```

### Check job status

```bash
GET /api/v1/jobs/:id
```

### List local images

```bash
GET /api/v1/images
```

### Search Docker Hub images (proxied through Server)

```bash
GET /api/v1/search?q=nginx&serverUrl=https://dockdock.baiduapi.com
```

### List image tags (proxied through Server)

```bash
GET /api/v1/tags/library/nginx?serverUrl=https://dockdock.baiduapi.com
```

### List local containers

```bash
GET /api/v1/containers
```
