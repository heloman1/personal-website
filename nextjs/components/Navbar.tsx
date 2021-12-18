import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { PropsWithChildren, useState } from "react";
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
    theme: ColorTheme;
}>;

export default function Navbar({ theme, setTheme, children }: NavbarProps) {
    return (
        <AppBar position="sticky">
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
                                        setTheme("dark");
                                    }}
                                >
                                    {theme === "dark" ? (
                                        <DarkMode />
                                    ) : (
                                        <DarkModeOutlined />
                                    )}
                                </IconButton>
                                <IconButton
                                    onClick={() => {
                                        setTheme("system");
                                    }}
                                >
                                    {theme === "system" ? (
                                        <ComputerTwoTone />
                                    ) : (
                                        <Computer />
                                    )}
                                </IconButton>
                                <IconButton
                                    onClick={() => {
                                        setTheme("light");
                                    }}
                                >
                                    {theme === "light" ? (
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
    );
}
