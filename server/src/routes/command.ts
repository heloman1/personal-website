import { FastifyInstance, FastifyPluginOptions } from "fastify";
import decodeJWTToken from "../hooks/firebase";

import gameQuery from "../data/gameQuery";
import Globals from "../globals";

const { gameFolderNameMap } = Globals.getGlobals();

let executingCommand = false;

export default function (
    routes: FastifyInstance,
    _opts: FastifyPluginOptions,
    _done: (err?: Error) => void
) {
    routes.addHook("onRequest", decodeJWTToken);
    routes.post("/server-command", async (req, res) => {
        const { command, game, server } = req.query as any;
        let folderName: string | undefined;
        if (game) {
            folderName = gameFolderNameMap.getRev(game as string);
        }
        if (folderName && server && command) {
            let query = {
                game: folderName,
                server: server as string,
                command: command as string,
            };
            if (executingCommand) {
                res.code(503); // Busy
            } else {
                executingCommand = true;
                try {
                    let is_online;
                    switch (command) {
                        case "stop":
                            await gameQuery.sendServerCommand(query);
                            is_online = false;
                            break;
                        case "start":
                        case "restart":
                            await gameQuery.sendServerCommand(query);
                            is_online = true;
                            break;
                        default:
                            res.code(400);
                            executingCommand = false;
                            return;
                    }
                    Globals.getGlobals().serverStatuses[game as string][
                        server as string
                    ].is_online = is_online;
                    res.code(200);
                } catch (err) {
                    console.log(err);
                    res.code(500);
                } finally {
                    executingCommand = false;
                }
            }
        } else {
            res.code(400);
        }
    });
}
