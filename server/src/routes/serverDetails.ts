import { Router } from "express";
import child_process from "child_process";
import { promisify } from "util";
let exec = promisify(child_process.exec);
let email_regex = /((([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*)|("(([\x01-\x08\x0B\x0C\x0E-\x1F\x7F]|[\x21\x23-\x5B\x5D-\x7E])|(\\[\x01-\x09\x0B\x0C\x0E-\x7F]))*"))@(([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*)|(\[(([\x01-\x08\x0B\x0C\x0E-\x1F\x7F]|[\x21-\x5A\x5E-\x7E])|(\\[\x01-\x09\x0B\x0C\x0E-\x7F]))*\])))/;
let router = Router();

interface ServerStatusesByGame {
    gameGame: string;
    serverStatuses: { name: string; status: boolean }[];
}

let gameList = [
    { folder_name: "minecraft", lgsm_name: "mcserver" },
    { folder_name: "terraria", lgsm_name: "terrariaserver" },
    { folder_name: "7dtd", lgsm_name: "sdtdserver" },
];
const FIVE_MINUTES = 5 * 60 * 1000;
let lastCheck = new Date(0);
let statusList: {
    game: string;
    server: string;
    is_online: boolean;
}[];
router.get("/servers-status", async (req, res) => {
    if (
        req.query.force !== undefined ||
        new Date().getTime() - lastCheck.getTime() > FIVE_MINUTES
    ) {
        const jsonList = (
            await exec(
                `ssh gameserver@edward-server ./check_server_statuses.zsh`
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
        lastCheck = new Date();
    }
    res.json(statusList);
});

router.post("/finishLogin", async (req, res) => {});

export default router;
