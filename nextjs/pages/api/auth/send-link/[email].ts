import { NextApiRequest, NextApiResponse } from "next";
import { getFirebaseAdmin, setAuthCookies } from "next-firebase-auth";
import initAuth from "utils/initAuth"; // the module you created above

initAuth();
const firebaseAuth = getFirebaseAdmin().auth();
const redirectUrl = "https://edwardgomez.dev/"
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { email } = req.query;
    if (Array.isArray(email)) {
        throw "/api/auth/send-link/[email] somehow recieved an array"
    }
    return;
    try {
        // firebaseAuth.generateSignInWithEmailLink(email, {});
        await setAuthCookies(req, res);
    } catch (e) {
        return res
            .status(500)
            .json({ error: "Unexpected error when logging in." });
    }
    return res.status(200).json({ success: true });
}
