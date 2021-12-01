// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { ServerStatuses } from "../../additional";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
const shell = promisify(exec);

type gameFolder = string;
const gameList: {
    [prettyName: string]: gameFolder;
} = {};
Object.entries<string>(
    JSON.parse(
        fs.readFileSync(`${process.cwd()}/private/games.json`).toString()
    )
).forEach(([gameFolderName, prettyName]) => {
    gameList[prettyName] = gameFolderName;
});

// TODO: Turn this into isQueryingOrCommanding
let isCommanding = false;
async function runCommand(
    game: string,
    server: string,
    command: string
): Promise<ServerStatuses> {
    return {};
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerStatuses>
) {
    let { game, server, command } = req.query;
    if (!game || !server || !command) {
        // Bad Request
        res.status(400).send({});
    } else {
        if (Array.isArray(game)) {
            game = game[0];
        }
        if (Array.isArray(server)) {
            server = server[0];
        }
        if (Array.isArray(command)) {
            command = command[0];
        }
        const changedData = await runCommand(game, server, command);
        res.status(200).json(changedData);
    }
}
