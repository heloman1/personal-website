#!/usr/bin/env zsh
setopt null_glob

echo_json() {
    game=$1
    server=$2
    server_details=$(./$game/$server/*server details | # get details
        sed 's/\x1b\[[0-9;]*m//g' |                    # strip colors
        egrep "Status:.\w|Internet IP:.+:" |           # regex data
        tr '\n\t' ' ' |                                # get rid of newlines and tabs
        tr -s ' ')                                     # squeeze spaces
    printf '{"game":"%s","server":"%s","details_string":"%s"}\n' $game $(basename $server) $server_details
}

cd ~/

for game in $(# for each in folder list
    echo $1 | jq -r ".[]"
); do
    if [ -d $game ]; then # if gamefolder exists
        for server in $game/*; do
            if command -v ./$server/*server >/dev/null; then
                # if a server exists in here
                echo_json $game $(basename $server) &
            fi
        done
    fi
done
