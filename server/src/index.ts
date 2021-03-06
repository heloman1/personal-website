import express from "express";
import args from "./args";
import Routes from "./routes";
import server from "./server";
const config = args.generateConfig();

let app = express();
app.use(express.json());
app.use(Routes);
app.use(express.static("assets"));
app.use(express.static("../client/dist/client"));

app.get("/*", async (req, res) => {
    res.sendFile("/index.html", { root: "../client/dist/client" });
});
server(app, config);
