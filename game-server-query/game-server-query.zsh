#!/usr/bin/env zsh
setopt null_glob

# Not actually async, buffered output is being relied on here to query multiple server at once
# without producing garbled output
buffered_output() {
    game=$1
    server=$2
    server_details=$(./$game/$server/*server details | # get details
        sed 's/\x1b\[[0-9;]*m//g')                     # strip colors

    # STARTED | STOPPED
    # $status is apparently read-only for some reason
    # -m 1 == get the first match
    # Delete tabs, newline, and spaces (should only be spaces)
    status_="$(echo "$server_details" |
        egrep -o 'STOPPED|STARTED' -m 1 |
        tr -d '\n\t ')"

    # 127.0.0.1:123456
    # Just the port
    port="$(echo $server_details |
        egrep '[0-9]\.[0-9]\.[0-9]\.[0-9]:[0-9]+$' -m 1 |
        egrep -o '[0-9]+$' |
        tr -d '\n\t ')"

    printf '{"game":"%s","server":"%s","status":"%s","port":"%s"}\n' \
        "$game" \
        "$(basename $server)" \
        "$status_" \
        "$port"
}

if [ $# -eq 1 ]; then
    games=($(echo $1 | jq -r '.[]'))
    for game in $games; do
        # echo "trying $game"
        if [ -d $game ]; then # if gamefolder exists (and is a directory)
            # echo "$game exists"
            for game_server in $game/*; do
                if [ -d $game_server ]; then # if $server is a folder
                    # echo "$game_server exists"
                    if command -v ./$game_server/*server >/dev/null; then
                        # if a server exists in here
                        # echo running
                        server=$(basename $game_server)
                        buffered_output $game $server &
                    fi
                fi
            done
        fi
    done
elif [ $# -eq 2 ]; then
    game=$1
    servers=($(echo $2 | jq -r '.[]'))
    if [ -d $game ]; then # if gamefolder exists (and is a directory)
        for server in $servers; do
            game_server="$game/$server"
            if [ -d $game_server ]; then # if $server is a folder
                if command -v ./$game_server/*server >/dev/null; then
                    # if a server exists in here
                    buffered_output $game $server &
                fi
            fi
        done
    fi
else
    echo 'Invalid arguments'
    echo 'Expected:'
    echo $0 '<game> <JSON array of server>'
    echo 'Or:'
    echo $0 '<JSON array of games>'
    exit 1
fi
