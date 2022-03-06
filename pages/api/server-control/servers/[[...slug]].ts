import { ServerHandlerState } from "utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import initAuth from "utils/initAuth";
import firebaseAdmin from "firebase-admin";
import { dataQueryHandler } from "utils/api/server-control/servers/servers";
import { commandHandler } from "utils/api/server-control/servers/command";
import { GameFolderToPrettyName, PrettyNameToGameFolder } from "utils/fileData";
import { emailsList, gamesList } from "utils/fileData";

let emails: string[] = [];
let folderMapping: {
    folderToPrettyName: GameFolderToPrettyName;
    PrettyNameToFolder: PrettyNameToGameFolder;
} = {
    folderToPrettyName: {},
    PrettyNameToFolder: {},
};

// Persistant state
const state: ServerHandlerState = {
    commandState: {
        isCommanding: false,
    },
    dataQueryState: {
        deferredResList: [],
        isQuerying: false,
        lastRevalidate: new Date(0).getTime(),
        waitTime: 5 * 60 * 1000, // 5 minutes, as millis, to match lastRevalidate (unix time)
    },
    serverDataCache: {},
};

// Automatically reload file if they change
(async () => {
    const gamesWatcher = gamesList();
    {
        const first = await gamesWatcher.next();
        if (!first.done) {
            console.log("Games loaded from games.json");
            state.dataQueryState.lastRevalidate = new Date(0).getTime();
            folderMapping = first.value;
        }
    }
    for await (const newMapping of gamesWatcher) {
        console.log("games.json was modified, invalidating cached game data");
        state.dataQueryState.lastRevalidate = new Date(0).getTime();
        folderMapping = newMapping;
    }
})();
(async () => {
    const emailsWatcher = emailsList();
    {
        const first = await emailsWatcher.next();
        if (!first.done) {
            console.log("Emails loaded from emails.json");
            emails = first.value;
        }
    }
    for await (const newList of emailsWatcher) {
        console.log("emails.json was modified");
        emails = newList;
    }
})();

// Init firebase (only once)
if (firebaseAdmin.apps.length === 0) initAuth();
const firebaseAuth = firebaseAdmin.auth();

// Because the 2 endpoints share data, they need to be in the same file
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Auth
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw "Auth header missing";
        const user = await firebaseAuth.verifyIdToken(token);
        if (!emails.includes(user.email!)) {
            throw `"${user.email} is not in the email list, and is unauthorized"`;
        }
    } catch (err) {
        console.log(err);
        res.status(401).end();
        return;
    }

    const { slug } = req.query;
    if (typeof slug === "string") {
        // slug should always be an array (or undefined)
        // (Unless somebody thinks they're slick
        // and tries /server-control/servers?slug=something)
        res.status(400).end();
        return;
    }

    if (!slug) {
        // /server-control/servers
        await dataQueryHandler(
            req,
            res,
            state,
            folderMapping.folderToPrettyName
        );
    } else {
        const [game, server, action] = slug;
        if (game && server && action) {
            // /server-control/servers/game/server
            await commandHandler(
                req,
                res,
                state,
                folderMapping.PrettyNameToFolder
            );
        } else {
            res.status(404).end();
        }
    }
}
