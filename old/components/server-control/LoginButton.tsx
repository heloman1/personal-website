import { Auth } from "firebase/auth";
import type { NextPage } from "next";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";

type LoginButtonProps = {
    firebaseAuth: Auth;
};

const LoginButton: NextPage<LoginButtonProps> = ({ firebaseAuth }) => {
    const router = useRouter();
    return (
        <>
            {firebaseAuth?.currentUser ? (
                <Button
                    color="inherit"
                    variant="outlined"
                    onClick={() => {
                        firebaseAuth.signOut();
                        router.reload();
                    }}
                >
                    {"Logout"}
                </Button>
            ) : (
                <Button color="inherit" variant="outlined">
                    <Link href="/server-control/login">Login</Link>
                </Button>
            )}
        </>
    );
};

export default LoginButton;
