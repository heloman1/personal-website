import { Router } from "express";
import { decodeJWTToken } from "../middleware/firebase";
import gameQuery from "../data/gameQuery";
import Globals from "../globals";

const { gameFolderNameMap } = Globals.getGlobals();

const router = Router();
router.use(decodeJWTToken);

let executingCommand = false;
router.post("/server-command", async (req, res) => {
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
            res.sendStatus(503); // Busy
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
                        res.sendStatus(400);
                        executingCommand = false;
                        return;
                }
                Globals.getGlobals().serverStatuses[game as string][
                    server as string
                ].is_online = is_online;
                res.sendStatus(200);
            } catch (err) {
                console.log(err);
                res.sendStatus(500);
            } finally {
                executingCommand = false;
            }
        }
    } else {
        res.sendStatus(400);
    }
});

export default router;
