import Globals from "./globals";
// Instanstiate Globals
if (typeof process.argv[2] === "string") {
    Globals.getGlobals(process.argv[2]);
}

import fastify from "fastify";
import fastifyStatic from "fastify-static";
import fs from "fs";

import path from "path";
import Routes from "./routes";

let app = fastify({
    http2: true,
    https: {
        allowHTTP1: true,
        key: fs.readFileSync("creds/privkey.pem"),
        cert: fs.readFileSync("creds/fullchain.pem"),
    },
});

app.decorateReply("user", null);

app.register(Routes);
app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
});

app.setNotFoundHandler(async (_, res) => {
    res.sendFile("/index.html", path.join(__dirname, "../public"));
});

app.listen(Globals.getGlobals().port, (err, address) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Listening on ${address}`);
    }
});
