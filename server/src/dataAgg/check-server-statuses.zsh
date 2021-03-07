#!/usr/bin/env zsh
cd ~/

for game in $(echo $1 | jq -r ".[]"); do
    for server_folder in $game/*; do
        echo \{ \"server\" : \"$server_folder\", \"details_string\" : \"$(./$server_folder/*server details | sed 's/\x1b\[[0-9;]*m//g' | egrep "Status:.\w|Internet IP:.+:")\" \} &
    done
done
