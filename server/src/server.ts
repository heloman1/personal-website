import https from "https";
import http from "http";
import fs from "fs";
import Globals from "./globals";
import { Express } from "express";

export default function startServer(app: Express) {
    const conf = Globals.getGlobals();
    let httpServer: https.Server | http.Server;
    if (Globals.getGlobals().insecure) {
        console.log("WARNING: NOT using HTTPS");
        httpServer = http.createServer(app);
    } else {
        let credentials = {
            key: fs.readFileSync("creds/privkey.pem"),
            cert: fs.readFileSync("creds/fullchain.pem"),
        };

        httpServer = https.createServer(credentials, app);
    }

    httpServer.listen(conf.port, () => {
        console.log(
            `Listening on ${
                conf.insecure ? "http" : "https"
            }://edwardgomez.dev:${conf.port}`
        );
    });
}
