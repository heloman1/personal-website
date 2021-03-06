import { Injectable } from '@angular/core';
import _firebase from 'firebase';
const firebaseConfig = {
    apiKey: 'AIzaSyCrM2dSNeEj1GatjS4l78zdrEoeKgRxzYE',
    authDomain: 'serverselect-be6d0.firebaseapp.com',
    projectId: 'serverselect-be6d0',
    storageBucket: 'serverselect-be6d0.appspot.com',
    messagingSenderId: '858468729816',
    appId: '1:858468729816:web:9fe801aa31baefc58f68ad',
};

var actionCodeSettings: _firebase.auth.ActionCodeSettings = {
    url: 'http://localhost:8080/servers',
    handleCodeInApp: true,
};

const EMAIL_KEY = 'emailForSignIn';
@Injectable({
    providedIn: 'root',
})
export class LoginService {
    firebase_auth: _firebase.auth.Auth;
    constructor() {
        this.firebase_auth = _firebase.initializeApp(firebaseConfig).auth();
    }

    async sendSignInEmail(email: string) {
        try {
            await this.firebase_auth.sendSignInLinkToEmail(
                email,
                actionCodeSettings
            );
            window.localStorage.setItem(EMAIL_KEY, email);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async tryCompleteSignIn() {
        // Confirm the link is a sign-in with email link.
        if (this.firebase_auth.isSignInWithEmailLink(window.location.href)) {
            let email = window.localStorage.getItem(EMAIL_KEY);
            if (!email) {
                window.alert(
                    'Please use the same device you used to send the email'
                );
            } else {
                // The client SDK will parse the code from the link for you.
                try {
                    let result = await this.firebase_auth.signInWithEmailLink(
                        email,
                        window.location.href
                    );
                    // You can access the new user via result.user
                    // Additional user info profile not available via:
                    // result.additionalUserInfo.profile == null
                    // You can check if the user is new or existing:
                    // result.additionalUserInfo.isNewUser
                    window.localStorage.removeItem(EMAIL_KEY);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    async signOut() {
        try {
            await this.firebase_auth.signOut();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
