import { NextApiRequest, NextApiResponse } from "next";
import type { ServerHandlerState } from "utils/types";

import { doSsh } from "utils/doSsh";

export async function sendServerCommand(
    req: NextApiRequest,
    res: NextApiResponse,
    state: ServerHandlerState,
    prettyNameToGameFolder: {
        [prettyName: string]: string;
    }
) {
    async function doServerCommand(
        prettyName: string,
        server: string,
        action: string
    ) {
        const gameFolderName = prettyNameToGameFolder[prettyName];
        try {
            console.log(
                `Command: Running ${action} for game "${gameFolderName}", server ${server}`
            );
            await doSsh(
                `ssh gameserver@edward-server ./${gameFolderName}/${server}/*server ${action}`
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    //401 unauth
    try {
        if (req.method === "POST") {
            // Don't queue multiple commands
            if (state.commandState.isCommanding) {
                res.status(503).send({});
                return;
            }
            state.commandState.isCommanding = true;

            const [game, server, action] = req.query["slug"] as string[];
            switch (action) {
                case "stop":
                    if (await doServerCommand(game, server, action)) {
                        state.serverDataCache[game][server].is_online = false;
                    } else {
                        throw `Command ${game} ${server} ${action} failed`;
                    }
                    break;
                case "start":
                case "restart":
                    if (await doServerCommand(game, server, action)) {
                        state.serverDataCache[game][server].is_online = true;
                    } else {
                        throw `Command ${game} ${server} ${action} failed`;
                    }
                    break;
                default:
                    throw `Unexpected command: ${action}`;
            }
            res.status(200).json(state.serverDataCache);

            state.commandState.isCommanding = false;
        } else {
            // Method not allowed
            res.status(405).send({});
        }
    } catch (e) {
        console.error("Error when doing game command");
        console.error(e);
        state.commandState.isCommanding = false;
        res.status(500).send({});
    }
}
