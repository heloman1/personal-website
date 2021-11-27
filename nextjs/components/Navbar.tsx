import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default function Navbar({ children }: PropsWithChildren<{}>) {
    return (
        <AppBar>
            <Toolbar>
                <Button color="inherit">
                    <Link href="/">Home</Link>
                </Button>
                <Button color="inherit">
                    <Link href="/server-control">Server Control</Link>
                </Button>
                <Button color="inherit">
                    <Link href="/about">About</Link>
                </Button>
                {children}
            </Toolbar>
        </AppBar>
    );
}
