import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { ButtonGroup, Grid, IconButton } from "@mui/material";
import { Computer, DarkMode, LightMode } from "@mui/icons-material";
import { ThemeMode } from "../additional";

export default function Navbar({
    setTheme,
    children,
}: PropsWithChildren<{ setTheme: Dispatch<SetStateAction<ThemeMode>> }>) {
    return (
        <AppBar>
            <Toolbar>
                <Grid container>
                    <Grid container item xs={6} spacing={2}>
                        <Grid item>
                            <Button color="inherit">
                                <Link href="/">Home</Link>
                            </Button>
                        </Grid>

                        <Grid item>
                            <Button color="inherit">
                                <Link href="/server-control">
                                    Server Control
                                </Link>
                            </Button>
                        </Grid>

                        <Grid item>
                            <Button color="inherit">
                                <Link href="/about">About</Link>
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid
                        container
                        item
                        xs={6}
                        justifyContent="end"
                        spacing={2}
                    >
                        {children}

                        <Grid item>
                            <ButtonGroup variant="contained">
                                <IconButton onClick={() => setTheme("dark")}>
                                    <DarkMode />
                                </IconButton>
                                <IconButton
                                    disabled
                                    onClick={() => setTheme("system")}
                                >
                                    <Computer />
                                </IconButton>
                                <IconButton onClick={() => setTheme("light")}>
                                    <LightMode />
                                </IconButton>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
}
