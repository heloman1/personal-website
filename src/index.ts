import express from "express";
import https from "https";
import http from "http";
import fs from "fs";

let credentials = {
    key: fs.readFileSync("ssl/privkey.pem"),
    cert: fs.readFileSync("ssl/fullchain.pem"),
};

let app = express();

app.use(express.static("public"));


//let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
    console.log(`Listening on https://edwardgomez.dev`);
});
