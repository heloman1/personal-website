import fs from "fs";
import TwoWayMap from "./twoWayMap";
type FolderName = string;
type GameName = string;
export default class Config {
    private static instance: Config;

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
    }

    public static getConfig(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }

        return Config.instance;
    }
}
