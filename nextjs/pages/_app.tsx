import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { AppPropsWithLayoutOverride, ColorTheme } from "../additional";
import { ThemeProvider, createTheme, CssBaseline, Grid } from "@mui/material";
import App from "next/app";
import initAuth from "./initAuth";


initAuth();

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

const lsThemeKey = "colortheme";
const themeValues: ColorTheme[] = ["light", "dark", "system"];

export default class MyApp extends App<
    AppPropsWithLayoutOverride,
    {},
    { themeMode: ColorTheme }
> {
    state: Readonly<{ themeMode: ColorTheme }> = {
        themeMode: "light",
    };

    componentDidMount() {
        let lsState = localStorage.getItem(lsThemeKey) as ColorTheme;
        if (!lsState || !themeValues.includes(lsState)) {
            lsState = "light";
        }
        this.setState({
            themeMode: lsState,
        });
    }

    componentDidUpdate() {
        localStorage.setItem(lsThemeKey, this.state.themeMode);
    }

    updateTheme(theme: ColorTheme) {
        this.setState({ themeMode: theme });
    }
    render() {
        const { Component, pageProps } = this.props;

        return (
            <ThemeProvider theme={themes[this.state.themeMode]}>
                <CssBaseline />
                <Navbar setTheme={this.updateTheme.bind(this)}>
                    <Grid item>{Component.NavbarExtraButtons}</Grid>
                </Navbar>
                <main>
                    <Component {...pageProps} />
                </main>
            </ThemeProvider>
        );
    }
}
