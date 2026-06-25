#!/bin/bash
set -e

REPO="Leskur/dockdock-agent"
INSTALL_DIR="/usr/local/bin"
SERVICE_NAME="dockdock-agent"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  ASSET_ARCH="x64" ;;
  aarch64) ASSET_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

# Get latest release tag
echo "Fetching latest release..."
LATEST_TAG=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep -o '"tag_name": *"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$LATEST_TAG" ]; then
  echo "Failed to fetch latest release tag"
  exit 1
fi

echo "Latest version: ${LATEST_TAG}"

ASSET_NAME="dockdock-agent-linux-${ASSET_ARCH}.tar.gz"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${ASSET_NAME}"

# Download
TMP_DIR=$(mktemp -d)
echo "Downloading ${ASSET_NAME}..."
curl -fsSL "$DOWNLOAD_URL" -o "${TMP_DIR}/${ASSET_NAME}"

# Extract
echo "Extracting..."
tar -xzf "${TMP_DIR}/${ASSET_NAME}" -C "$TMP_DIR"

# Install binary
echo "Installing to ${INSTALL_DIR}/"
install -m 755 "${TMP_DIR}/dockdock-agent" "${INSTALL_DIR}/dockdock-agent"

# Clean up
rm -rf "$TMP_DIR"

# Create systemd service
echo "Creating systemd service..."
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=DockDock Agent
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
ExecStart=${INSTALL_DIR}/dockdock-agent
Restart=on-failure
RestartSec=5
Environment=PORT=8910
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

echo ""
echo "Installation complete!"
echo "  Service:  systemctl status ${SERVICE_NAME}"
echo "  Logs:     journalctl -u ${SERVICE_NAME} -f"
echo "  Web UI:   http://localhost:8910"
