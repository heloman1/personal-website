import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    TextField,
} from "@mui/material";
import { useState } from "react";
import EmailValidator from "email-validator";

export default function Login() {
    let [isEmailInvalid, setInvalidEmail] = useState(false);
    let [helperText, setHelperText] = useState("");
    return (
        <Grid
            container
            spacing={0}
            alignContent="center"
            justifyContent="center"
            style={{ minHeight: "100vh" }}
        >
            <Card sx={{ width: 300 }}>
                <CardContent>
                    <h2>Login</h2>
                    <TextField
                        color="primary"
                        id="email-input"
                        error={isEmailInvalid}
                        required
                        type="email"
                        variant="outlined"
                        label="Email"
                        onBlur={(e) => {
                            const email = e.target.value;
                            const isInvalidEmail =
                                !EmailValidator.validate(email);
                            let helperText = "";

                            if (email === "") {
                                helperText = "Please enter an email";
                            } else if (isInvalidEmail) {
                                helperText = "Email is not valid";
                            }

                            setHelperText(helperText);
                            setInvalidEmail(isInvalidEmail);
                        }}
                        onChange={(e) => {
                            if (isEmailInvalid) {
                                setInvalidEmail(false);
                                setHelperText("");
                            }
                        }}
                        helperText={helperText}
                    ></TextField>
                </CardContent>
                <CardActions>
                    <Button>Send Sign-In Link</Button>
                </CardActions>
            </Card>
        </Grid>
    );
}
