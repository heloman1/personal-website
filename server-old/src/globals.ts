import fs from "fs";
import TwoWayMap from "./utils/twoWayMap";
import { OutgoingServerStatuses } from "./types";
import { BehaviorSubject } from "rxjs";
const DATA_FOLDER = "data/";

type FolderName = string;
type GameName = string;

export default class Globals {
    private static instance: Globals;

    serverStatuses: BehaviorSubject<OutgoingServerStatuses>;
    port: number;
    gameFolderNameMap: TwoWayMap<FolderName, GameName>;
    emailList: {
        [email: string]: {
            access_level: number;
        };
    };

    private constructor(configPath: string) {
        const { port, gamesList, emailsList } = JSON.parse(
            fs.readFileSync(configPath).toString()
        );

        if (Number.isInteger(port)) {
            this.port = port;
        } else {
            const defaultPort = 443;
            console.warn(
                `Warning: port not correctly set in config. Setting to default (${defaultPort})`
            );
            this.port = defaultPort;
        }

        if (typeof gamesList === "string") {
            this.gameFolderNameMap = new TwoWayMap(
                JSON.parse(
                    fs.readFileSync(`${DATA_FOLDER}/${gamesList}`).toString()
                )
            );
        } else {
            console.warn(
                `Warning: games.json not set in config. Setting to null)`
            );
            this.gameFolderNameMap = new TwoWayMap();
        }

        if (typeof emailsList === "string") {
            this.emailList = JSON.parse(
                fs.readFileSync(`${DATA_FOLDER}/${emailsList}`).toString()
            );
        } else {
            console.warn(
                `Warning: emails.json not set in config. Setting to null)`
            );
            this.emailList = {};
        }

        this.serverStatuses = new BehaviorSubject({});
    }

    public static getGlobals(configPath?: string): Globals {
        if (!Globals.instance) {
            if (configPath) {
                Globals.instance = new Globals(configPath);
            } else {
                throw new Error("Cannot init Globals without a config path");
            }
        }

        return Globals.instance;
    }
}
