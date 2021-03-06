import { Router } from "express";
import child_process from "child_process";
import { promisify } from "util";
import config from "../config";

let shell = promisify(child_process.exec);
const FIVE_MIN = 5 * 60 * 1000;
let lastCheck = new Date(0).getTime();
let router = Router();

let statusList: {
    [game: string]: {
        [server: string]: {
            is_online: boolean;
        };
    };
} = {};
router.get("/servers-status", async (req, res) => {
    const conf = config.getConfig();
    if (
        req.query.force !== undefined ||
        new Date().getTime() - lastCheck > FIVE_MIN
    ) {
        const jsonList = (
            await shell(
                `ssh gameserver@edward-server ./check_server_statuses.zsh ${conf.gameList}`
            )
        ).stdout
            .trim()
            .split("\n");

        statusList = {};
        jsonList.forEach((j) => {
            let data: {
                server: string;
                details_string: string;
            } = JSON.parse(j);
            const [game, server] = data.server.split("/");
            if (statusList[game] === undefined) {
                statusList[game] = {};
            }
            statusList[game][server] = {
                is_online: data.details_string.includes("ONLINE"),
            };
        });
        lastCheck = new Date().getTime();
    }
    res.json(statusList);
});

async function sendServerCommand(query: any) {
    await shell(
        `ssh gameserver@edward-server ./${query.game}/${query.server}/*server ${query.command}`
    );
}
router.post("/server-command", async (req, res) => {
    //TODO: Firebase Auth REQUIRED Here

    try {
        const { command, game, server } = req.query;
        if (game && server && command) {
            let is_online;
            switch (command) {
                case "stop":
                    await sendServerCommand(req.query);
                    is_online = false;
                    break;
                case "start":
                case "restart":
                    await sendServerCommand(req.query);
                    is_online = true;
                    break;
                default:
                    res.sendStatus(400);
                    return;
            }
            statusList[game as string][server as string].is_online = is_online;
            res.sendStatus(200);
            return;
        }
    } catch (err) {
        console.log(err);
    }
    res.sendStatus(400);
});

export default router;
