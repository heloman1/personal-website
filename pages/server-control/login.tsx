import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    TextField,
    Typography,
} from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
    isSignInWithEmailLink,
    signInWithEmailLink,
    getAuth,
    sendSignInLinkToEmail,
} from "firebase/auth";
import { useRouter } from "next/router";
import { getApps, initializeApp } from "firebase/app";

const firebaseSettings = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID,
};

type LoginState = {
    fieldError: boolean;
    askForEmailAgain: boolean;
};
export default function Login() {
    if (getApps().length === 0) initializeApp(firebaseSettings);
    const router = useRouter();
    const emailLocalStorageKey = "emailForSignIn";
    let [state, setState] = useState<LoginState>({
        fieldError: false,
        askForEmailAgain: false,
    });

    /**
     * Use Firebase to finish auth, then navigate to /server-control
     */
    const finishSignIn = useCallback(
        async (email: string) => {
            try {
                await signInWithEmailLink(
                    getAuth(),
                    email!,
                    window.location.href
                );
                window.localStorage.removeItem(emailLocalStorageKey);
                router.push("/server-control");
            } catch (e) {
                console.error(e);
            }
        },
        [router]
    );

    /**
     * If this is the first time the user is inputting an email,
     * this will send a verification email
     *
     * If the user has opened the sent link in a different browser
     * (or someone is trying a session fixation attack),
     * ask for the email again
     */
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Typescript doesnt know whats going on here
        // e.target (among other stuff) has an array of everything in the form
        // target[0] is the email field
        const email = (e.target as any)[0].value;

        if (state.askForEmailAgain) {
            finishSignIn(email);
        } else {
            const auth = getAuth();

            sendSignInLinkToEmail(auth, email, {
                url: "https://edwardgomez.dev/server-control/login",
                handleCodeInApp: true,
            }).catch((e) => {
                console.log(e);
            });
        }
    };

    /**
     * Use the browser built-in checks to tell if the email is valid
     *
     * (Don't replace with an npm module that uses a broken regex
     * that doesn't allow emails without top level domains)
     * (And yes, according to the spec, "name@example" is a valid email)
     */
    const handleEmailValidity = useCallback(() => {
        const validityState = (
            document.getElementById("email-input") as HTMLTextAreaElement
        ).validity;
        setState({
            ...state,
            fieldError:
                validityState.valueMissing || validityState.typeMismatch,
        });
    }, [state]);

    useEffect(() => {
        // I would love to do this server side, but it has to be done here
        // due to session fixation attacks
        const auth = getAuth();
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem(emailLocalStorageKey);
            if (!email) {
                // User opened the link on a different device. To prevent
                // session fixation attacks, ask the user to provide
                // the associated email again.
                setState((s) => ({ ...s, askForEmailAgain: true }));
                return;
            }
            finishSignIn(email);
        }
    }, [finishSignIn]);
    useEffect(() => {
        // onSubmit ONLY triggers if the email is valid
        // (Without this useEffect, it would allow a successful submit
        // while the TextField is still red,
        // which looks pretty bad)
        const element = document.getElementById(
            "email-input"
        ) as HTMLTextAreaElement;
        element.addEventListener("invalid", handleEmailValidity);
        return () => {
            element.removeEventListener("invalid", handleEmailValidity);
        };
    }, [handleEmailValidity]);

    return (
        <Grid
            container
            spacing={0}
            alignContent="center"
            justifyContent="center"
            style={{ minHeight: "100vh" }}
        >
            <Card sx={{ width: 300 }}>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <Typography variant="h5">
                            <span>Login</span>
                        </Typography>

                        {state.askForEmailAgain ? (
                            <Typography variant="body1">
                                {/* I could explain that this has to done because
                            a different browser was used (fixation attacks).
                            But the most common place where this could happen
                            is on a phone, and there's a non-zero chance that
                            an accurate message will just confuse user who was
                            unaware that they were using a different browser.
                            (Send link from Chrome app -> open link in Gmail
                            app's integrated web browser )
                            And a 100% chance an armchair expert will think
                            they can code around such a "limitation". */}
                                <span>
                                    Something weird happened, please enter your
                                    email one last time.
                                </span>
                            </Typography>
                        ) : (
                            ""
                        )}
                        <TextField
                            color="primary"
                            id="email-input"
                            error={state.fieldError}
                            required
                            type="email"
                            variant="outlined"
                            label="Email"
                            onBlur={handleEmailValidity}
                            onSubmit={handleEmailValidity}
                            onChange={() => {
                                setState({ ...state, fieldError: false });
                            }}
                        />
                    </CardContent>
                    <CardActions>
                        <Button type="submit">
                            {state.askForEmailAgain
                                ? "Submit"
                                : "Send Sign-In Link"}
                        </Button>
                    </CardActions>
                </form>
            </Card>
        </Grid>
    );
}
