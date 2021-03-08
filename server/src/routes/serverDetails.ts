import { Request, Router } from "express";
import child_process from "child_process";
import { promisify } from "util";
import config from "../config";
import { decodeJWTToken } from "../firebase";
import Condition from "../condition";

let shell = promisify(child_process.exec);
const conf = config.getConfig();
const FIVE_MIN = 5 * 60 * 1000;
let lastCheck = new Date(0).getTime();
let router = Router();
router.use(decodeJWTToken);

let currentlyChecking = new Condition(false);
let executingCommand = false;

let statusList: {
    [game: string]: {
        [server: string]: {
            is_online: boolean;
            port: number;
        };
    };
} = {};

router.get("/servers-status", async (req, res) => {
    if (currentlyChecking.state === true) {
        await currentlyChecking.waitForCondition(false);
    } else {
        currentlyChecking.state = true;
        if (
            req.query.force !== undefined ||
            new Date().getTime() - lastCheck > FIVE_MIN
        ) {
            let jsonList: string[];
            try {
                let shell_output = await shell(
                    `ssh gameserver@edward-server './check_server_statuses.zsh '\\''${JSON.stringify(
                        conf.gameList
                    )}'\\'''`
                );
                jsonList = shell_output.stdout.trim().split("\n");
            } catch (err) {
                res.sendStatus(500);
                console.log(err);
                return;
            }

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
                let [_0, _1, ip_port, _3, status] = data.details_string.split(
                    " "
                );
                let [_ip, port] = ip_port.split(":");
                statusList[game][server] = {
                    is_online: status === "ONLINE",
                    port: Number.parseInt(port),
                };
            });
            lastCheck = new Date().getTime();
        }
        currentlyChecking.state = false;
    }

    res.json(statusList);
});

async function sendServerCommand(query: any) {
    await shell(
        `ssh gameserver@edward-server ./${query.game}/${query.server}/*server ${query.command}`
    );
}
router.post("/server-command", async (req, res) => {
    if (executingCommand) {
        res.sendStatus(503);
    } else {
        executingCommand = true;
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
                        executingCommand = false;
                        return;
                }
                statusList[game as string][
                    server as string
                ].is_online = is_online;
                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
        executingCommand = false;
    }
});

export default router;
