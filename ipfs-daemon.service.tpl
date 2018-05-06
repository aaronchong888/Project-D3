[Unit]
Description=IPFS daemon
Wants=network.target
After=network.target

[Service]
Type=simple
Environment=IPFS_PATH=/home/ubuntu/.ipfs
ExecStart=/usr/local/bin/ipfs daemon --enable-gc
ExecStop=/usr/bin/pkill -f ipfs
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
