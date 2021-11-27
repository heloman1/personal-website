import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { AppPropsWithLayoutOverride, ThemeMode } from "../additional";
import { ThemeProvider, createTheme, CssBaseline, Grid } from "@mui/material";
import { useState } from "react";

const themes = {
    dark: createTheme({
        palette: {
            mode: "dark",
        },
    }),
    light: createTheme({
        palette: {
            mode: "light",
        },
    }),
    system: createTheme({
        palette: {
            mode: "light",
        },
    }),
};
function MyApp({ Component, pageProps }: AppPropsWithLayoutOverride) {
    let [themeMode, setThemeMode] = useState<ThemeMode>("light");
    return (
        <ThemeProvider theme={themes[themeMode]}>
            <CssBaseline />
            <Navbar setTheme={setThemeMode}>
                <Grid item>
                    {Component.NavbarExtraButtons}
                </Grid>
            </Navbar>
            <main>
                <Component {...pageProps} />
            </main>
        </ThemeProvider>
    );
}

export default MyApp;
