import { NextApiRequest, NextApiResponse } from "next";
import type {
    ServerHandlerState,
    ServerStatuses,
    ShellQueryData,
} from "utils/types";
import { doSsh } from "utils/doSsh";

export async function getServersStatuses(
    req: NextApiRequest,
    res: NextApiResponse,
    state: ServerHandlerState,
    gameFolderToPrettyName: {
        [prettyName: string]: string;
    }
) {
    const {
        dataQueryState: { deferredResList, waitTime },
    } = state;
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
                new Date().getTime() - state.dataQueryState.lastRevalidate >
                waitTime
            ) {
                // If we're already querying, defer until later...
                // (Don't run multiple redundant queries)
                if (state.dataQueryState.isQuerying) {
                    deferredResList.push(() => {
                        res.status(200).json(state.serverDataCache);
                    });
                    return;
                } else {
                    state.dataQueryState.isQuerying = true;
                    const serverData = shellDataToServerStatuses(
                        await getServerData(Object.keys(gameFolderToPrettyName))
                    );
                    state.serverDataCache = serverData;
                    state.dataQueryState.lastRevalidate = new Date().getTime();
                    state.dataQueryState.isQuerying = false;
                    // ...this is later
                    deferredResList.forEach((fn) => fn());
                    state.dataQueryState.deferredResList = [];
                }
            }
            res.status(200).json(state.serverDataCache);
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
