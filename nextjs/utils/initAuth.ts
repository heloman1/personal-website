import { init } from "next-firebase-auth";

const initAuth = () => {
    init({
        firebaseClientInitConfig: {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID,
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_AUTH_DOMAIN,
        },
        appPageURL: "/server-control",
        loginAPIEndpoint: "/api/auth/login",
        logoutAPIEndpoint: "/api/auth/logout",
        // firebaseAuthEmulatorHost: 'localhost:9099',
        // Required in most cases.
        firebaseAdminInitConfig: {
            credential: {
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
            },
            databaseURL: "",
        },
        cookies: {
            name: "ExampleApp", // required
            // Keys are required unless you set `signed` to `false`.
            // The keys cannot be accessible on the client side.
            keys: [
                process.env.COOKIE_SECRET_CURRENT,
                process.env.COOKIE_SECRET_PREVIOUS,
            ],
            httpOnly: true,
            maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
            overwrite: true,
            path: "/",
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production", // set this to false in local (non-HTTPS) development
            signed: true,
        },
    });
};

export default initAuth;
