#!/usr/bin/env zsh

cd ~/

gameList=("minecraft" "terraria" "7dtd" "starbound")
for game in $gameList ; do
    for server_folder in $game/* ; do
            echo \{ \"server\" : \"$server_folder\", \"details_string\" : \"$(./$server_folder/*server details | sed 's/\x1b\[[0-9;]*m//g' | egrep "Status:.\w")\" \} &
    done
done