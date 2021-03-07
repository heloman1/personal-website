import * as admin from "firebase-admin";
let firebaseAdmin = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

export default firebaseAdmin;
