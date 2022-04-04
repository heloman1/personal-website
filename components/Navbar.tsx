import Link from "next/link";
import { PropsWithChildren, useEffect, useState } from "react";
import {
    Toolbar,
    AppBar,
    ButtonGroup,
    Drawer,
    Grid,
    IconButton,
    List,
    ListItem,
    Button,
} from "@mui/material";
import {
    Computer,
    ComputerTwoTone,
    DarkMode,
    DarkModeOutlined,
    LightMode,
    LightModeOutlined,
    Menu,
} from "@mui/icons-material";
import { ColorTheme } from "../utils/types";

type NavbarProps = PropsWithChildren<{
    setTheme: (theme: ColorTheme) => void;
    theme: ColorTheme;
}>;

export default function Navbar({ theme, setTheme, children }: NavbarProps) {
    const [state, setState] = useState({
        mobile: false,
        drawerOpen: false,
    });
    const openDrawer = () => {
        setState({ ...state, drawerOpen: true });
    };
    const closeDrawer = () => {
        setState({ ...state, drawerOpen: false });
    };

    const links = [
        ["Home", "/"],
        ["Server Control", "/server-control"],
        ["About", "/about"],
    ];
    useEffect(() => {
        const checkWidth = () => {
            window.innerWidth < 700
                ? setState((s) => {
                      return { ...s, mobile: true };
                  })
                : setState((s) => {
                      return { ...s, mobile: false };
                  });
        };

        checkWidth();
        window.addEventListener("resize", checkWidth);

        return () => window.removeEventListener("resize", checkWidth);
    }, []);

    return (
        <AppBar position="sticky">
            <Toolbar component={Grid} container>
                <Grid container item xs spacing={2}>
                    {state.mobile ? (
                        <>
                            <Drawer
                                anchor="top"
                                open={state.drawerOpen}
                                onClose={closeDrawer}
                            >
                                <List>
                                    {links.map(([name, link], i) => (
                                        <ListItem key={i}>
                                            <Link href={link} passHref>
                                                <Button
                                                    onClick={closeDrawer}
                                                    color="inherit"
                                                >
                                                    {name}
                                                </Button>
                                            </Link>
                                        </ListItem>
                                    ))}
                                </List>
                            </Drawer>
                            <Grid item>
                                <IconButton onClick={openDrawer}>
                                    <Menu />
                                </IconButton>
                            </Grid>
                        </>
                    ) : (
                        <>
                            {links.map(([name, link], i) => (
                                <Grid item key={i}>
                                    <Link href={link} passHref>
                                        <Button color="inherit">{name}</Button>
                                    </Link>
                                </Grid>
                            ))}
                        </>
                    )}
                </Grid>

                <Grid
                    container
                    item
                    xs
                    justifyContent="flex-end"
                    // spacing={2}
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
            </Toolbar>
        </AppBar>
    );
}
