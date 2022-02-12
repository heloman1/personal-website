import { ServerStatuses, ShellQueryData } from "additional";
import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";

import initAuth from "utils/initAuth";
import firebaseAdmin from "firebase-admin";

const shell = promisify(exec);

type gameFolder = string;
type PrettyName = string;
type SharedState = {
    serverDataCache: ServerStatuses;
};
type ServerDataHandlerState = {
    deferredResList: (() => any)[];
    isQuerying: boolean;
    lastRevalidate: number;
};

type ServerCommandHandlerState = { isCommanding: boolean };

const gameFolderToPrettyName: {
    [game: gameFolder]: PrettyName;
} = JSON.parse(readFileSync(`${process.cwd()}/private/games.json`).toString());

const prettyNameToGameFolder: {
    [prettyName: PrettyName]: gameFolder;
} = {};
Object.entries<string>(gameFolderToPrettyName).forEach(
    ([gameFolderName, prettyName]) => {
        if (prettyNameToGameFolder[prettyName]) {
            throw `The pretty name ${prettyName} is being used twice`;
        }
        prettyNameToGameFolder[prettyName] = gameFolderName;
    }
);

const sharedState: SharedState = { serverDataCache: {} };
const dataPullerState: ServerDataHandlerState = {
    deferredResList: [],
    isQuerying: false,
    lastRevalidate: new Date(0).getTime(),
};
const fiveMinutes = 5 * 60 * 1000; // as millis, to match lastRevalidate (unix time)
const gameCommandHandlerState: ServerCommandHandlerState = {
    isCommanding: false,
};

async function doSsh(command: string) {
    try {
        return (await shell(command)).stdout;
    } catch (err) {
        console.error("fetchData: Error when executing shell command");
        console.error(`(${command})`);
        console.error(err);
        throw err;
    }
}

async function serverDataPuller(req: NextApiRequest, res: NextApiResponse) {
    async function getServerData(
        gameList: string[]
    ): Promise<ShellQueryData[]> {
        let serverData: ShellQueryData[];
        // let shell_output: string;

        // I don't understand fully why i need this many quotations,
        // but it doesn't work otherwise
        const shell_output = await doSsh(
            `ssh ${
                process.env.SSH_HOST
            } './check_server_statuses.zsh '\\''${JSON.stringify(
                gameList
            )}'\\'''`
        );

        try {
            serverData = shell_output
                .trim()
                .split("\n")
                .map((val) => JSON.parse(val));
            serverData.sort((a, b) => (a.server < b.server ? -1 : 1));
            return serverData;
        } catch (err) {
            console.error("fetchData: error when parsing JSON");
            throw err;
        }
    }

    function shellDataToServerStatuses(
        shellData: ShellQueryData[]
    ): ServerStatuses {
        const out: ServerStatuses = {};

        shellData.map(({ server, details_string, gameFolderName }) => {
            const gameName =
                gameFolderToPrettyName[gameFolderName] || "Unknown";

            const serverName = server || "Unknown";

            const [, , ip_port_s, , status_s] = details_string
                .trim()
                .split(" ");

            const expectedPort = Number.parseInt(ip_port_s.split(":")[1]);
            const port = expectedPort || -1;

            const is_online = status_s === "STARTED";

            if (!out[gameName]) {
                out[gameName] = {};
            }

            out[gameName][serverName] = {
                is_online: is_online,
                port: port,
            };
        });
        return out;
    }

    try {
        if (req.method == "GET") {
            // Cache the server statuses for 5 minutes
            if (
                new Date().getTime() - dataPullerState.lastRevalidate >
                fiveMinutes
            ) {
                // If we're already querying, defer until later...
                // (Don't run multiple redundant queries)
                if (dataPullerState.isQuerying) {
                    dataPullerState.deferredResList.push(() => {
                        res.status(200).json(sharedState.serverDataCache);
                    });
                    return;
                } else {
                    dataPullerState.isQuerying = true;
                    const serverData = shellDataToServerStatuses(
                        await getServerData(Object.keys(gameFolderToPrettyName))
                    );
                    sharedState.serverDataCache = serverData;
                    dataPullerState.lastRevalidate = new Date().getTime();
                    dataPullerState.isQuerying = false;
                    // ...this is later
                    dataPullerState.deferredResList.forEach((fn) => fn());
                    dataPullerState.deferredResList = [];
                }
            }
            res.status(200).json(sharedState.serverDataCache);
        } else {
            // Method not allowed
            res.status(405).send({});
        }
    } catch (e) {
        console.error("Error when fetching game data");
        console.error(e);

        res.status(500).send({});
    }
}

async function serverCommandHandler(req: NextApiRequest, res: NextApiResponse) {
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
            if (gameCommandHandlerState.isCommanding) {
                res.status(503).send({});
                return;
            }
            gameCommandHandlerState.isCommanding = true;

            const [game, server, action] = req.query["slug"] as string[];
            switch (action) {
                case "stop":
                    if (await doServerCommand(game, server, action)) {
                        sharedState.serverDataCache[game][server].is_online =
                            false;
                    } else {
                        throw `Command ${game} ${server} ${action} failed`;
                    }
                    break;
                case "start":
                case "restart":
                    if (await doServerCommand(game, server, action)) {
                        sharedState.serverDataCache[game][server].is_online =
                            true;
                    } else {
                        throw `Command ${game} ${server} ${action} failed`;
                    }
                    break;
                default:
                    throw `Unexpected command: ${action}`;
            }
            res.status(200).json(sharedState.serverDataCache);

            gameCommandHandlerState.isCommanding = false;
        } else {
            // Method not allowed
            res.status(405).send({});
        }
    } catch (e) {
        console.error("Error when doing game command");
        console.error(e);
        gameCommandHandlerState.isCommanding = false;
        res.status(500).send({});
    }
}
if (firebaseAdmin.apps.length === 0) initAuth();
const firebaseAuth = firebaseAdmin.auth();

const emails: string[] = JSON.parse(
    readFileSync("private/emails.json").toString()
);
// Because the 2 endpoints share data, I need them in the same file (???)
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw "Auth header missing";
        const user = await firebaseAuth.verifyIdToken(token);
        if (!emails.includes(user.email!)) {
            throw `"${user.email} is not in the email list, and is unauthorized"`;
        }
    } catch (err) {
        console.log(err);
        res.status(401).end();
        return;
    }
    const { slug } = req.query;

    if (typeof slug === "string") {
        // slug should always be an array (or undefined)
        // Unless somebody thinks they're slick
        // and tries /server-control/servers?slug=something
        res.status(400).end();
        return;
    }

    if (!slug) {
        // /server-control/servers
        await serverDataPuller(req, res);
    } else {
        const [game, server, action] = slug;
        if (game && server && action) {
            // /server-control/servers/game/server
            await serverCommandHandler(req, res);
        } else {
            res.status(404).end();
        }
    }
}
