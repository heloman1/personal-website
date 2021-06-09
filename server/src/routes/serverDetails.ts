import { FastifyInstance, FastifyPluginOptions } from "fastify";
import gameQuery from "../data/gameQuery";
import Globals from "../globals";
import decodeJWTToken from "../hooks/firebase";
import DeferredFunctions from "../utils/deferredFunctions";
import pushSseClient from "../services/sse";
const folderList = Array.from(Globals.getGlobals().gameFolderNameMap.keys());
const FIVE_MIN = 5 * 60 * 1000;

const polledResponses = new DeferredFunctions<void, void>();
let currentlyChecking = false;
let lastCheck = new Date(0).getTime(); // Set date to 1970

async function updateServerData(force: boolean) {
    if (force || new Date().getTime() - lastCheck > FIVE_MIN) {
        try {
            // TODO: Return if data hasn't changed
            Globals.getGlobals().serverStatuses.next(
                await gameQuery.fetchData(folderList)
            );
            lastCheck = new Date().getTime();
        } catch (err) {
            console.error(err);
        }
    }
}

export default function (
    routes: FastifyInstance,
    _opts: FastifyPluginOptions,
    done: (err?: Error) => void
) {
    routes.addHook("onRequest", decodeJWTToken);
    routes.get<{
        Querystring: {
            force: any;
        };
    }>("/servers-status", async (req, res) => {
        if (currentlyChecking === true) {
            // Webserver is currently querying, wait for it to finish before sending
            polledResponses.push(() => {
                res.send(Globals.getGlobals().serverStatuses);
            });
            return; // Don't hit the res.send at the bottom
        }

        const force = req.query.force !== undefined;
        await updateServerData(force);

        res.send(Globals.getGlobals().serverStatuses.getValue());
        polledResponses.consumeAll(); // This will do nothing if its empty
    });
    routes.get("/servers-status/sse", async (_req, res) => {
        res.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
        });
        pushSseClient(res);
    });
    done();
}

// Still gotta do client side
