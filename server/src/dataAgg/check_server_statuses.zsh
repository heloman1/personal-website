#!/usr/bin/env zsh
cd ~/

for game in $(# for each in folder list
    echo $1 | jq -r ".[]"
); do
    if [ -d $game ]; then # if gamefolder exists
        for server_folder in $game/*; do
            # return data
            if [ -d $server_folder ]; then # if subfolder exists
                echo \{ \"server\" : \"$server_folder\", \"details_string\" : \"$(./$server_folder/*server details | sed 's/\x1b\[[0-9;]*m//g' | egrep "Status:.\w|Internet IP:.+:")\" \} &
            fi
        done
    fi
done
