import admin from "firebase-admin";

const initAuth = () => {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        }),
    });
    // firebaseClientInitConfig: {
    //     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID,
    //     apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY,
    //     authDomain: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_AUTH_DOMAIN,
    // },
};

export default initAuth;
