#!/usr/bin/env sh
cd "${0%/*}"

# TMUX_SESSION=webserver
# echo 'Killing Web Server'
# tmux kill-session -t $TMUX_SESSION

#echo 'Copying Certs'
#sudo ln -s /etc/letsencrypt/live/edwardgomez.dev/privkey.pem privkey.pem
#sudo ln -s /etc/letsencrypt/live/edwardgomez.dev/fullchain.pem fullchain.pem
#sudo chown $USER:$USER creds/privkey.pem creds/fullchain.pem

NVM_DIR="$HOME/.nvm"
set -e
echo "Sourcing nvm (and npm, and node)"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
echo 'Starting Web Server'
npm run build
npm start
