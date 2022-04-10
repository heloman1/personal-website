import Link from "next/link";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import {
    Toolbar,
    AppBar,
    Drawer,
    Grid,
    IconButton,
    List,
    ListItem,
    Button,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import ThemeControl from "./ThemeControl";
import { NavbarContext } from "./NavbarContext";

export default function Navbar({ children }: PropsWithChildren<{}>) {
    const [state, setState] = useState({
        mobile: false,
        drawerOpen: false,
    });

    const [navbarButtons, setNavbarButtons] = useState<JSX.Element>(<></>);
    const setNavbarButtonsCallback = useCallback(setNavbarButtons, [
        setNavbarButtons,
    ]);
    const openDrawer = () => {
        setState({ ...state, drawerOpen: true });
    };
    const closeDrawer = () => {
        setState({ ...state, drawerOpen: false });
    };

    const links = [
        ["Home", "/"],
        ["Server Control", "/server-control"],
        ["Server Control Demo", "/server-control/demo"],
        ["About", "/about"],
    ].map(([name, link], i) => (
        <Grid item key={i}>
            <Link href={link} passHref>
                <Button color="inherit">{name}</Button>
            </Link>
        </Grid>
    ));

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
        <>
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
                                        {links.map((butElem, i) => (
                                            <ListItem
                                                key={i}
                                                onClick={closeDrawer}
                                            >
                                                {butElem}
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
                            links
                        )}
                    </Grid>

                    <Grid
                        container
                        item
                        xs
                        justifyContent="flex-end"
                        spacing={2}
                    >
                        {/* Extra Buttons */}
                        <Grid item>{navbarButtons}</Grid>

                        <Grid item>
                            <ThemeControl />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <NavbarContext.Provider value={{ setNavbarButtons }}>
                {children}
            </NavbarContext.Provider>
        </>
    );
}
