import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";
let firebaseAdmin = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

declare global {
    namespace Express {
        export interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}

export async function decodeJWTToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.headers.authorization?.startsWith("Bearer ")) {
        const token = req.headers.authorization.split("Bearer ")[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req["user"] = decodedToken;
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log("Auth missing");
    }

    next();
}

export default firebaseAdmin;
