#!/usr/bin/env sh
cat <<EOF > ~/.config/systemd/user/personal-website.service
[Unit]
Description=Starts the website API server

[Service]
Type=simple
StandardOutput=journal
ExecStart=$(realpath ~/personal-website/server/start.sh)

[Install]
WantedBy=default.target

EOF
