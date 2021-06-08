import { FastifyInstance, FastifyPluginOptions, FastifyReply } from "fastify";
import gameQuery from "../data/gameQuery";
import Globals from "../globals";
import decodeJWTToken from "../hooks/firebase";
import DeferredFunctions from "../utils/deferredFunctions";

const folderList = Array.from(Globals.getGlobals().gameFolderNameMap.keys());
const FIVE_MIN = 5 * 60 * 1000;

const polledResponses = new DeferredFunctions<void>();
let currentlyChecking = false;
let lastCheck = new Date(0).getTime(); // Set date to 1970

const sseResponses = new DeferredFunctions<void>(false);

function sseWrite(res: FastifyReply, event: string, data: string) {
    res.raw.write(`event: ${event}\ndata: ${data}\n\n`);
}

export default function (
    routes: FastifyInstance,
    _opts: FastifyPluginOptions,
    done: (err?: Error) => void
) {
    routes.addHook("onRequest", decodeJWTToken);
    routes.get("/servers-status", async (req, res) => {
        if (currentlyChecking === true) {
            // Webserver is currently querying, wait for it to finish before sending
            polledResponses.push(() => {
                res.send(Globals.getGlobals().serverStatuses);
            });
            return; // Don't hit the res.send at the bottom
        }

        if (
            (req.query as any).force !== undefined ||
            new Date().getTime() - lastCheck > FIVE_MIN
        ) {
            // Time to update data
            currentlyChecking = true;

            try {
                Globals.getGlobals().serverStatuses = await gameQuery.fetchData(
                    folderList
                );
                lastCheck = new Date().getTime();
            } catch (err) {
                console.error(err);
                res.code(500);
                return;
            } finally {
                currentlyChecking = false;
            }
        }
        res.send(Globals.getGlobals().serverStatuses);
        polledResponses.consumeAll(); // This will do nothing if its empty
    });
    routes.get("/servers-status/sse", async (req, res) => {
        res.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
        });
        const id = sseResponses.push(() => {
            sseWrite(
                res,
                "serverData",
                JSON.stringify(Globals.getGlobals().serverStatuses)
            );
        });
        res.raw.on("close", () => {
            sseResponses.kick(id);
            res.raw.end();
        });
    });
    done();
}

export function procSse() {
    sseResponses.consumeAll();
}

// Still gotta do client side
