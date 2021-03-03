import https from "https";
import http from "http";
import fs from "fs";
import { Config } from "./args";
import { Express } from "express";

export default function startServer(app: Express, config: Config) {
    let httpServer: https.Server | http.Server;
    if (config.insecure) {
        console.log("WARNING: NOT using HTTPS");
        httpServer = http.createServer(app);
    } else {
        let credentials = {
            key: fs.readFileSync("creds/privkey.pem"),
            cert: fs.readFileSync("creds/fullchain.pem"),
        };

        httpServer = https.createServer(credentials, app);
    }

    httpServer.listen(config.port, () => {
        console.log(
            `Listening on ${
                config.insecure ? "http" : "https"
            }://edwardgomez.dev:${config.port}`
        );
    });
}
