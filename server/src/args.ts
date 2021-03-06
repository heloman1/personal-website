export interface Config {
    insecure: boolean;
    port: number;
    gameList: string[];
}

let config: Config | null = null;

export default {
    generateConfig(): Config {
        const insecure = process.argv[2] === "insecure" ? true : false;
        let port: number;

        if (process.argv[3]) {
            port = +process.argv[3];
        } else if (insecure) {
            port = 8080;
        } else {
            port = 443;
        }
        config = {
            insecure: insecure,
            port: port,
            gameList: ["minecraft", "terraria", "7dtd", "starbound"],
        };

        return config;
    },
    config,
};
