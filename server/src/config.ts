import fs from "fs";
export default class Config {
    private static instance: Config;

    insecure: boolean;
    port: number;
    gameList: string[];
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
        this.gameList = JSON.parse(
            fs.readFileSync("data/games.json").toString()
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
