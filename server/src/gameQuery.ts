import child_process from "child_process";
import { promisify } from "util";
import config from "./config";

const nameMap = config.getConfig().gameFolderNameMap.map;
let shell = promisify(child_process.exec);

interface ExpectedJSONData {
    game: string;
    server: string;
    details_string: string;
}

async function queryData(gameList: string[]): Promise<ExpectedJSONData[]> {
    let jsonList: string[];
    try {
        let shell_output = await shell(
            `ssh gameserver@edward-server './check_server_statuses.zsh '\\''${JSON.stringify(
                gameList
            )}'\\'''`
        );
        jsonList = shell_output.stdout.trim().split("\n");
    } catch (err) {
        console.error("fetchData: Error when executing shell command");
        throw err;
    }
    let serverData: ExpectedJSONData[] = [];
    for (let j of jsonList) {
        try {
            serverData.push(JSON.parse(j));
        } catch (err) {
            console.error("fetchData: error when parsing JSON");
            console.error(`failing input: ${j}`);
            console.error(err);
        }
    }
    return serverData;
}

export interface ServerStatuses {
    [game: string]: {
        [server: string]: {
            is_online: boolean;
            port: number;
        };
    };
}

function formatData(jsonList: ExpectedJSONData[]): ServerStatuses {
    let serverStatuses: ServerStatuses = {};
    for (let json of jsonList) {
        // details_string: "Internet IP: 100.1.111.60:7777 Status: STOPPED "
        let { game, server } = json;
        let [, , ip_port, , , status] = json.details_string.trim().split(" ");
        let [, port_string] = ip_port.split(":");

        let port = Number.parseInt(port_string);
        let is_online = status === "STARTED";

        game = nameMap.get(game)!;
        if (!game) {
            game = "Unknown";
        }

        if (!server) server = "Unknown";
        if (!port) port = -1;

        if (serverStatuses[game] === undefined) {
            serverStatuses[game] = {};
        }

        serverStatuses[game][server] = {
            is_online: is_online,
            port: port,
        };
    }

    return serverStatuses;
}

export default {
    async fetchData(gameList: string[]) {
        let jsonList = await queryData(gameList);
        return formatData(jsonList);
    },
    async sendServerCommand(query: {
        game: string;
        server: string;
        command: string;
    }) {
        return await shell(
            `ssh gameserver@edward-server ./${query.game}/${query.server}/*server ${query.command}`
        );
    },
};
