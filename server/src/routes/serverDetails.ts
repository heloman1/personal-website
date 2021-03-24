import { Router } from "express";
import Globals from "../globals";
import { decodeJWTToken } from "../middleware/firebase";
import gameQuery from "../data/gameQuery";
import FunctionQueue from "../utils/functionQueue";

const gameFolderNameMap = Globals.getGlobals().gameFolderNameMap;
const folderList = Array.from(gameFolderNameMap.keys());
const FIVE_MIN = 5 * 60 * 1000;
const router = Router();
router.use(decodeJWTToken);

const queuedResponses = new FunctionQueue();
let currentlyChecking = false;
let lastCheck = new Date(0).getTime();
router.get("/servers-status", async (req, res) => {
    if (currentlyChecking === true) {
        // Webserver is currently querying, wait for it to finish before sending
        queuedResponses.addToQueue(() => {
            res.json(Globals.getGlobals().serverStatuses);
        });
        return; // Don't hit the res.json at the bottom
    }

    if (
        req.query.force !== undefined ||
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
            res.sendStatus(500);
            return;
        } finally {
            currentlyChecking = false;
        }
    }
    res.json(Globals.getGlobals().serverStatuses);
    queuedResponses.consumeAll(); // This will do nothing if its empty
});

export default router;
