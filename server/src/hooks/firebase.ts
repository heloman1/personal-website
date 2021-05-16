import { FastifyReply, FastifyRequest } from "fastify";
import admin from "firebase-admin";
import Globals from "../globals";
let conf = Globals.getGlobals();
let firebaseAdmin = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

export default async function decodeJWTToken(
    req: FastifyRequest,
    res: FastifyReply
) {
    // Check Authorization Header
    if (req.headers.authorization?.startsWith("Bearer ")) {
        const token = req.headers.authorization.split("Bearer ")[1];

        try {
            // This will throw if failed
            const decodedToken = await firebaseAdmin
                .auth()
                .verifyIdToken(token);

            // Sanity check
            if (decodedToken.email) {
                const emailValues = conf.emailList[decodedToken.email];
                if (emailValues !== undefined) {
                    // This email exists in email list
                    // and verified
                    req.user = decodedToken;
                    return;
                } else {
                    console.log(`${decodedToken.email} not in email list`);
                }
            }
        } catch (err) {
            console.log("Error, verification probably failed");
            console.log(err);
        }
    } else {
        console.log("No Auth header was given");
    }

    res.code(401);
    res.send();
    return;
}
