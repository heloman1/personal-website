import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    ActionCodeSettings,
    Auth,
    getAuth,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
} from '@firebase/auth';
import { BehaviorSubject } from 'rxjs';

const actionCodeSettings: ActionCodeSettings = {
    url: 'https://edwardgomez.dev/servers/login',
    handleCodeInApp: true,
};

const firebaseApp = initializeApp({
    apiKey: 'AIzaSyCrM2dSNeEj1GatjS4l78zdrEoeKgRxzYE',
    authDomain: 'serverselect-be6d0.firebaseapp.com',
    projectId: 'serverselect-be6d0',
    storageBucket: 'serverselect-be6d0.appspot.com',
    messagingSenderId: '858468729816',
    appId: '1:858468729816:web:9fe801aa31baefc58f68ad',
});

/** Local Storage Key (The key is arbitrary) */
const EMAIL_KEY = 'emailForSignIn';
@Injectable({
    providedIn: 'root',
})
export class LoginService {
    // Expected to be used by a page
    isSignedIn = new BehaviorSubject<boolean>(false);

    /**
     * Returns the users token, expected to be used as the bearer token
     * in an Authorization header
     */
    public get userToken() {
        if (this.auth.currentUser) {
            return this.auth.currentUser.getIdToken();
        } else {
            // Just to make this function only return a Promise<string>
            return new Promise<string>((res) => res(''));
        }
    }

    /**
     * Sends a signin link to the given emaik
     * @param email is not checked in this function and is expected to be checked by the UI
     * @returns {Promise<boolean>} Promise\<boolean\> based on if the email was sent succesfully
     */
    async sendSignInEmail(email: string): Promise<boolean> {
        try {
            sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
            window.localStorage.setItem(EMAIL_KEY, email);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * Attempts to authenticate by using the link sent to the email by {@link sendSignInEmail}
     * @returns {Promise<boolean>} Promise\<boolean\> based on if authentication was successful
     */
    async tryCompleteSignIn(emailLink: string) {
        // Confirm the link is a sign-in with email link.
        if (isSignInWithEmailLink(this.auth, emailLink)) {
            let email = window.localStorage.getItem(EMAIL_KEY);
            if (!email) {
                window.alert(
                    'Please use the same device you used to send the email'
                );
            } else {
                // The client SDK will parse the code from the link for you.
                try {
                    let result = await signInWithEmailLink(
                        this.auth,
                        email,
                        emailLink
                    );
                    window.localStorage.removeItem(EMAIL_KEY);
                    if (result.user) {
                        return true;
                    }
                    // You can access the new user via result.user
                    // Additional user info profile not available via:
                    // result.additionalUserInfo.profile == null
                    // You can check if the user is new or existing:
                    // result.additionalUserInfo.isNewUser
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return false;
    }

    async signOut() {
        try {
            await this.auth.signOut();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    private auth: Auth;
    constructor() {
        this.auth = getAuth(firebaseApp);

        onAuthStateChanged(this.auth, async (user) => {
            this.isSignedIn.next(user ? true : false);
        });
    }
}
