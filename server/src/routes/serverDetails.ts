import { Router } from "express";
import Globals from "../globals";
import { ServerStatuses } from "../globals";
import { decodeJWTToken } from "../middleware/firebase";
import gameQuery from "../data/gameQuery";
import FunctionQueue from "../utils/functionQueue";

const gameFolderNameMap = Globals.getGlobals().gameFolderNameMap;
const folderList = Array.from(gameFolderNameMap.keys());
const FIVE_MIN = 5 * 60 * 1000;
const router = Router();
router.use(decodeJWTToken);

let statusList: ServerStatuses = {};

const queuedResponses = new FunctionQueue();
let currentlyChecking = false;
let lastCheck = new Date(0).getTime();
router.get("/servers-status", async (req, res) => {
    if (currentlyChecking === true) {
        queuedResponses.addToQueue(() => {
            res.json(statusList);
        });
        return;
    }

    if (
        req.query.force !== undefined ||
        new Date().getTime() - lastCheck > FIVE_MIN
    ) {
        currentlyChecking = true;

        try {
            Globals.getGlobals().serverStatuses = await gameQuery.fetchData(
                folderList
            );
            lastCheck = new Date().getTime();
        } catch (err) {
            console.error("Error when fetching data");
            console.error(err);
            res.sendStatus(500);
            return;
        } finally {
            currentlyChecking = false;
        }
        res.json(statusList);
        queuedResponses.runAll();
    }
});

export default router;
