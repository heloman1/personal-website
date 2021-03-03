#!/usr/bin/env sh
SESSION=webserver
echo 'Killing Web Server'
tmux kill-session -t $SESSION

echo 'Copying Certs'
sudo cp /etc/letsencrypt/live/edwardgomez.dev/privkey.pem creds
sudo cp /etc/letsencrypt/live/edwardgomez.dev/fullchain.pem creds
sudo chown pi:pi creds/privkey.pem creds/fullchain.pem

npm run build

echo 'Starting Web Server'
tmux new -d -s $SESSION authbind npm start