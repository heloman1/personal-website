// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { ShellQueryData, ServerStatuses } from "../../additional";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
const shell = promisify(exec);

type PrettyName = string;
const gameList: {
    [game: string]: PrettyName;
} = JSON.parse(
    fs.readFileSync(`${process.cwd()}/private/games.json`).toString()
);

async function getServerData(gameList: string[]): Promise<ShellQueryData[]> {
    let serverData: ShellQueryData[];
    let shell_output: string;
    try {
        // I don't understand fully why i need this many quotations, but it works
        shell_output = (
            await shell(
                `ssh ${
                    process.env.SSH_HOST
                } './check_server_statuses.zsh '\\''${JSON.stringify(
                    gameList
                )}'\\'''`
            )
        ).stdout;
    } catch (err) {
        console.error("fetchData: Error when executing shell command");
        console.error(err);
        throw err;
    }

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
        const gameName = gameList[gameFolderName] || "Unknown";

        const serverName = server || "Unknown";

        const [, , ip_port_s, , status_s] = details_string.trim().split(" ");

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerStatuses>
) {
    const serverData = shellDataToServerStatuses(
        await getServerData(Object.keys(gameList))
    );
    res.status(200).json(serverData);
}

// Static Gen - no
// Dynamic Gen - would work, but long tts
// API - low tts, but csr
// Nested Routes
