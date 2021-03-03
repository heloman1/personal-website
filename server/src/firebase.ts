import fs from "fs";
import firebase from "firebase";
let firebaseAdmin = firebase.initializeApp(fs.readFileSync("creds/firebase.json"));

export default firebaseAdmin;