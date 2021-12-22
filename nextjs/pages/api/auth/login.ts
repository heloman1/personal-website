import { NextApiRequest, NextApiResponse } from "next";
import { setAuthCookies } from "next-firebase-auth";
import initAuth from "utils/initAuth"; // the module you created above

initAuth();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await setAuthCookies(req, res);
    } catch (e) {
        return res
            .status(500)
            .json({ error: "Unexpected error when logging in." });
    }
    return res.status(200).json({ success: true });
}
