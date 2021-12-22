import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    TextField,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";

// import { GetServerSideProps } from "next";
// export const getServerSideProps: GetServerSideProps = async (context) => {
//     console.log(context.req.headers.referer);
//     return { props: {} };
// };

function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Implement Firebase
}

export default function Login() {
    let [fieldError, setFieldError] = useState(false);

    const handleEmailValidity = () => {
        const validityState = (
            document.getElementById("email-input") as HTMLTextAreaElement
        ).validity;
        console.log(validityState);

        setFieldError(validityState.valueMissing || validityState.typeMismatch);
    };

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
    }, []);
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
                        <h2>Login</h2>
                        <TextField
                            color="primary"
                            id="email-input"
                            error={fieldError}
                            required
                            type="email"
                            variant="outlined"
                            label="Email"
                            onBlur={handleEmailValidity}
                            onSubmit={handleEmailValidity}
                            onChange={() => {
                                setFieldError(false);
                            }}
                        />
                    </CardContent>
                    <CardActions>
                        <Button type="submit">Send Sign-In Link</Button>
                    </CardActions>
                </form>
            </Card>
        </Grid>
    );
}
