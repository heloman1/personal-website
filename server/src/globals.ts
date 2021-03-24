import fs from "fs";
import TwoWayMap from "./utils/twoWayMap";
type FolderName = string;
type GameName = string;

export interface ServerStatuses {
    [game: string]: {
        [server: string]: {
            is_online: boolean;
            port: number;
        };
    };
}

export default class Globals {
    private static instance: Globals;

    serverStatuses: ServerStatuses;
    insecure: boolean; // Are we using http or https?
    port: number;
    gameFolderNameMap: TwoWayMap<FolderName, GameName>;
    emailList: {
        [email: string]: {
            access_level: number;
        };
    };

    private constructor() {
        const insecure = process.argv[2] === "insecure" ? true : false;
        let port: number;

        if (process.argv[3]) {
            port = +process.argv[3];
        } else if (insecure) {
            port = 8080;
        } else {
            port = 443;
        }

        this.insecure = insecure;
        this.port = port;

        this.gameFolderNameMap = new TwoWayMap(
            JSON.parse(fs.readFileSync("data/games.json").toString())
        );
        this.emailList = JSON.parse(
            fs.readFileSync("data/emails.json").toString()
        );
        this.serverStatuses = {};
    }

    public static getGlobals(): Globals {
        if (!Globals.instance) {
            Globals.instance = new Globals();
        }

        return Globals.instance;
    }
}
