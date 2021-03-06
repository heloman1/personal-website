import { Router } from "express";
import child_process from "child_process";
import { promisify } from "util";
import config from "../config";

let shell = promisify(child_process.exec);
const FIVE_MIN = 5 * 60 * 1000;
let lastCheck = new Date(0).getTime();
let router = Router();

let statusList: {
    game: string;
    server: string;
    is_online: boolean;
}[] = [];

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

        statusList = jsonList.map((j) => {
            let data: {
                server: string;
                details_string: string;
            } = JSON.parse(j);
            const [game, server] = data.server.split("/");

            return {
                game: game,
                server: server,
                is_online: data.details_string.includes("ONLINE"),
            };
        });
        lastCheck = new Date().getTime();
    }
    res.json(statusList);
});

router.get("/setServer", async (req, res) => {
    //TODO: Firebase Auth REQUIRED Here
    let server;
});

export default router;
