import { Router } from "express";
import firebaseAdmin from "../firebase";

let email_regex = /((([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*)|("(([\x01-\x08\x0B\x0C\x0E-\x1F\x7F]|[\x21\x23-\x5B\x5D-\x7E])|(\\[\x01-\x09\x0B\x0C\x0E-\x7F]))*"))@(([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*)|(\[(([\x01-\x08\x0B\x0C\x0E-\x1F\x7F]|[\x21-\x5A\x5E-\x7E])|(\\[\x01-\x09\x0B\x0C\x0E-\x7F]))*\])))/;
let router = Router();



router.get("/test", async (req, res) => {
    console.log(req.headers);
    console.log(req.body);

    //Make sure the email is good
    const email = req.body.email;
    if (email_regex.test(email)) {
        
    }
    res.json({ success: true });
});

router.post("/finishLogin", async (req, res) => {
    
})

export default router;
