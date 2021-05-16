import { FastifyInstance, FastifyPluginOptions } from "fastify";
import gameQuery from "../data/gameQuery";
import Globals from "../globals";
import decodeJWTToken from "../hooks/firebase";
import FunctionQueue from "../utils/functionQueue";

const gameFolderNameMap = Globals.getGlobals().gameFolderNameMap;
const folderList = Array.from(gameFolderNameMap.keys());
const FIVE_MIN = 5 * 60 * 1000;

const queuedResponses = new FunctionQueue();
let currentlyChecking = false;
let lastCheck = new Date(0).getTime();

export default function (
    routes: FastifyInstance,
    _opts: FastifyPluginOptions,
    done: (err?: Error) => void
) {
    routes.addHook("onRequest", decodeJWTToken);
    routes.get("/servers-status", async (req, res) => {
        if (currentlyChecking === true) {
            // Webserver is currently querying, wait for it to finish before sending
            queuedResponses.addToQueue(() => {
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
        queuedResponses.consumeAll(); // This will do nothing if its empty
    });
    done();
}
