import express from "express";
import Routes from "./routes";
import server from "./server";

import Globals from "./globals";

if (typeof process.argv[1] === "string") {
    Globals.getGlobals(process.argv[1]);
}

let app = express();
app.use(express.json());
app.use(Routes);
app.use(express.static("assets"));
app.use(express.static("../client/dist/client"));

app.get("/*", async (_, res) => {
    res.sendFile("/index.html", { root: "../client/dist/client" });
});

server(app);
