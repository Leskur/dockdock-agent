# DockDock Agent

用于从 DockDock Server 下载 Docker 镜像的客户端。

## 环境要求

- Node.js 18+
- 已安装 Docker，且 `docker` 命令在 PATH 中可用

## 安装

```bash
npm install
cp .env.example .env
```

按需编辑 `.env`，调整默认端口、监听地址和 Server URL。

## 运行

```bash
npm run dev
```

Agent 默认监听 `http://0.0.0.0:8910`。

打开浏览器访问 `http://服务器IP:8910` 即可使用 Web 界面。

## 环境变量

| 变量 | 默认值 | 说明 |
|----------|---------|-------------|
| `PORT` | `8910` | Agent 监听端口 |
| `HOST` | `0.0.0.0` | Agent 监听地址 |
| `DEFAULT_SERVER_URL` | `https://dockdock.baiduapi.com` | Web 界面中默认显示的 Server URL |

## API

### 部署镜像

```bash
POST /api/v1/deploy
{
  "image": "nginx",
  "tag": "1.25",
  "serverUrl": "https://dockdock.baiduapi.com",
  "serverToken": "optional"
}
```

响应：

```json
{
  "id": "uuid",
  "status": "pending"
}
```

### 列出所有任务

```bash
GET /api/v1/jobs
```

### 查看任务状态

```bash
GET /api/v1/jobs/:id
```

### 搜索 Docker Hub 镜像（通过 Server 代理）

```bash
GET /api/v1/search?q=nginx&serverUrl=https://dockdock.baiduapi.com
```

### 列出镜像标签（通过 Server 代理）

```bash
GET /api/v1/tags/library/nginx?serverUrl=https://dockdock.baiduapi.com
```
