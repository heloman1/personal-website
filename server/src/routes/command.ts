import { FastifyInstance, FastifyPluginOptions } from "fastify";
import gameQuery from "../data/gameQuery";
import Globals from "../globals";
import decodeJWTToken from "../hooks/firebase";
import { CommandRouteInterface } from "../types";
import { sseSendServerData } from "./serverDetails";

const { gameFolderNameMap } = Globals.getGlobals();

let executingCommand = false;

export default function (
    routes: FastifyInstance,
    _opts: FastifyPluginOptions,
    done: (err?: Error) => void
) {
    routes.addHook("onRequest", decodeJWTToken);
    routes.post<CommandRouteInterface>(
        "/server-command",
        {
            // Fastify should validate these
            schema: {
                querystring: {
                    game: { type: "string" },
                    command: { type: "string" },
                    server: { type: "string" },
                },
            },
        },
        async (req, res) => {
            // 503 : Busy/Server Unavailable
            // 500 : Server Error
            // 400 : Bad Argument
            // 200 : Success
            const { command, game, server } = req.query;
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
                                executingCommand = false;
                                res.code(400).send();
                                return;
                        }
                        Globals.getGlobals().serverStatuses[game][
                            server
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
            res.send();
            sseSendServerData();
        }
    );
    done();
}
