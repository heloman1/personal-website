import { ServerHandlerState } from "utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync } from "fs";

import initAuth from "utils/initAuth";
import firebaseAdmin from "firebase-admin";
import { dataQueryHandler } from "utils/api/server-control/servers/servers";
import { commandHandler } from "utils/api/server-control/servers/command";

type gameFolder = string;
type PrettyName = string;

const gameFolderToPrettyName: {
    [game: gameFolder]: PrettyName;
} = JSON.parse(readFileSync(`${process.cwd()}/private/games.json`).toString());

const prettyNameToGameFolder: {
    [prettyName: PrettyName]: gameFolder;
} = {};
Object.entries<string>(gameFolderToPrettyName).forEach(
    ([gameFolderName, prettyName]) => {
        if (prettyNameToGameFolder[prettyName]) {
            throw `The pretty name ${prettyName} is being used twice`;
        }
        prettyNameToGameFolder[prettyName] = gameFolderName;
    }
);

const emails: string[] = JSON.parse(
    readFileSync("private/emails.json").toString()
);

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

if (firebaseAdmin.apps.length === 0) initAuth();
const firebaseAuth = firebaseAdmin.auth();

// Because the 2 endpoints share data, I need them in the same file (???)
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
        await dataQueryHandler(req, res, state, gameFolderToPrettyName);
    } else {
        const [game, server, action] = slug;
        if (game && server && action) {
            // /server-control/servers/game/server
            await commandHandler(req, res, state, prettyNameToGameFolder);
        } else {
            res.status(404).end();
        }
    }
}
