import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { PropsWithChildren, ReactNode, useState } from "react";
import { ButtonGroup, Grid, IconButton } from "@mui/material";
import {
    Computer,
    ComputerTwoTone,
    DarkMode,
    DarkModeOutlined,
    LightMode,
    LightModeOutlined,
} from "@mui/icons-material";
import { ColorTheme } from "../additional";

type NavbarProps = PropsWithChildren<{
    setTheme: (theme: ColorTheme) => void;
}>;

export default function Navbar({ setTheme, children }: NavbarProps) {
    // 0 - system, 1 - light, 2 - dark
    let [selectedButtonTheme, setSelectedButtonTheme] = useState(0);
    return (
        <>
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
                            {/* Extra Buttons */}
                            {children ? <Grid item>{children}</Grid> : ""}

                            {/* Theme Buttons */}
                            <Grid item>
                                <ButtonGroup variant="contained">
                                    <IconButton
                                        onClick={() => {
                                            setSelectedButtonTheme(2);
                                            setTheme("dark");
                                        }}
                                    >
                                        {selectedButtonTheme === 2 ? (
                                            <DarkMode />
                                        ) : (
                                            <DarkModeOutlined />
                                        )}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setSelectedButtonTheme(0);
                                            setTheme("system");
                                        }}
                                    >
                                        {selectedButtonTheme === 0 ? (
                                            <ComputerTwoTone />
                                        ) : (
                                            <Computer />
                                        )}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setSelectedButtonTheme(1);
                                            setTheme("light");
                                        }}
                                    >
                                        {selectedButtonTheme === 1 ? (
                                            <LightMode />
                                        ) : (
                                            <LightModeOutlined />
                                        )}
                                    </IconButton>
                                </ButtonGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </>
    );
}
