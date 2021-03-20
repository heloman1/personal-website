import { Router } from "express";
import config from "../config";
import { decodeJWTToken } from "../firebase";
import Condition from "../condition";
import gameQuery from "../gameQuery";
import { ServerStatuses } from "../gameQuery";

const folderList = Array.from(config.getConfig().gameFolderNameMap.map.keys());
const gameNameFolderMap = config.getConfig().gameFolderNameMap.revMap;
const FIVE_MIN = 5 * 60 * 1000;
let lastCheck = new Date(0).getTime();
let router = Router();
router.use(decodeJWTToken);

let currentlyChecking = new Condition(false);
let executingCommand = false;

let statusList: ServerStatuses = {};

router.get("/servers-status", async (req, res) => {
    if (currentlyChecking.state === true) {
        await currentlyChecking.waitForCondition(false);
    } else if (
        req.query.force !== undefined ||
        new Date().getTime() - lastCheck > FIVE_MIN
    ) {
        currentlyChecking.state = true;

        try {
            statusList = await gameQuery.fetchData(folderList);
            lastCheck = new Date().getTime();
        } catch (err) {
            console.error("Error when fetching data");
            console.error(err);
            res.sendStatus(500);
            return;
        } finally {
            currentlyChecking.state = false;
        }
    }

    res.json(statusList);
});

router.post("/server-command", async (req, res) => {
    const { command, game, server } = req.query;
    let folderName: string | undefined;
    if (game) {
        folderName = gameNameFolderMap.get(game as string);
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
                statusList[game as string][
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
