import { Router } from "express";
import config from "../config";
import { decodeJWTToken } from "../middleware/firebase";
import gameQuery from "../data/gameQuery";
import { ServerStatuses } from "../data/gameQuery";
import FunctionQueue from "../utils/functionQueue";

const gameFolderNameMap = config.getConfig().gameFolderNameMap;
const folderList = Array.from(gameFolderNameMap.keys());
const FIVE_MIN = 5 * 60 * 1000;
const router = Router();
router.use(decodeJWTToken);

let statusList: ServerStatuses = {};

const queuedResponses = new FunctionQueue();
let currentlyChecking = false;
let lastCheck = new Date(0).getTime();
router.get("/servers-status", async (req, res) => {
    if (currentlyChecking === true) {
        queuedResponses.addToQueue(() => {
            res.json(statusList);
        });
        return;
    }

    if (
        req.query.force !== undefined ||
        new Date().getTime() - lastCheck > FIVE_MIN
    ) {
        currentlyChecking = true;

        try {
            statusList = await gameQuery.fetchData(folderList);
            lastCheck = new Date().getTime();
        } catch (err) {
            console.error("Error when fetching data");
            console.error(err);
            res.sendStatus(500);
            return;
        } finally {
            currentlyChecking = false;
        }
        res.json(statusList);
        queuedResponses.runAll();
    }
});

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
