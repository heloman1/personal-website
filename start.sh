#!/usr/bin/env sh
SESSION=webserver
echo 'Killing Web Server'
tmux kill-session -t $SESSION

echo 'Copying Certs'
sudo cp /etc/letsencrypt/live/edwardgomez.dev/privkey.pem ssl
sudo cp /etc/letsencrypt/live/edwardgomez.dev/fullchain.pem ssl
sudo chown pi:pi ssl/privkey.pem ssl/fullchain.pem

npm run build

echo 'Starting Web Server'
tmux new -d -s $SESSION authbind npm start