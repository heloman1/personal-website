import express from "express";
import https from "https";
import http from "http";
import fs from "fs";

const IS_INSECURE = process.argv[2] === "insecure" ? true : false;
let PORT : number;

if (process.argv[3]) {
    PORT = +process.argv[3];
} else if (IS_INSECURE) {
    PORT = 8080;
} else {
    PORT = 443;
}

let app = express();

app.use(express.static("public"));

let httpServer: https.Server | http.Server;
if (IS_INSECURE) {
    console.log("WARNING: NOT using HTTPS");
    httpServer = http.createServer(app);
} else {
    let credentials = {
        key: fs.readFileSync("ssl/privkey.pem"),
        cert: fs.readFileSync("ssl/fullchain.pem"),
    };

    httpServer = https.createServer(credentials, app);
}

httpServer.listen(PORT, () => {
    console.log(
        `Listening on ${
            IS_INSECURE ? "http" : "https"
        }://edwardgomez.dev:${PORT}`
    );
});
