#!/usr/bin/env sh
cd "${0%/*}"

TMUX_SESSION=webserver
echo 'Killing Web Server'
tmux kill-session -t $TMUX_SESSION

#echo 'Copying Certs'
#sudo ln -s /etc/letsencrypt/live/edwardgomez.dev/privkey.pem privkey.pem
#sudo ln -s /etc/letsencrypt/live/edwardgomez.dev/fullchain.pem fullchain.pem
#sudo chown $USER:$USER creds/privkey.pem creds/fullchain.pem

echo 'Starting Web Server'

tmux new -d -s $TMUX_SESSION "GOOGLE_APPLICATION_CREDENTIALS='./creds/firebase.json' node build/index.js data/config.json"