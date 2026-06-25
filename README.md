# DockDock Agent

DockDock Agent 是一个 Docker 镜像部署工具，专为无法正常拉取 Docker Hub 镜像的环境设计。

通过配合 [DockDock Server](https://github.com/Leskur/dockdock-server) 作为镜像代理，用户可以在网络受限的环境下搜索、下载并部署 Docker 镜像，全程通过 Web 界面操作，无需命令行。

## 特性

- 通过 DockDock Server 代理拉取镜像，解决 Docker Hub 访问失败问题
- 搜索镜像直接部署，无需手动 `docker pull` + `docker run`
- 单文件分发，服务器零依赖
- 一键安装，自动注册为系统服务

## 截图

<!-- TODO: 添加 Web 界面截图 -->
![Web 界面](docs/screenshot.png)

## 环境要求

- Linux x64 / arm64
- 已安装 Docker，且 `docker` 命令在 PATH 中可用

## 一键安装

```bash
curl -fsSL https://raw.githubusercontent.com/Leskur/dockdock-agent/main/install.sh | bash
```

安装完成后自动注册为 systemd 服务并启动。

Web 界面：`http://服务器IP:8910`

> 如果无法直接访问 GitHub，可通过代理安装：`curl -fsSL https://raw.githubusercontent.com/Leskur/dockdock-agent/main/install.sh | https_proxy=http://127.0.0.1:7890 bash`

## 卸载

```bash
curl -fsSL https://raw.githubusercontent.com/Leskur/dockdock-agent/main/uninstall.sh | bash
```

## 服务管理

```bash
systemctl status dockdock-agent    # 查看状态
systemctl restart dockdock-agent   # 重启
systemctl stop dockdock-agent      # 停止
journalctl -u dockdock-agent -f    # 查看日志
```
