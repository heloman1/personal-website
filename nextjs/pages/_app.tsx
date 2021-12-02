import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { AppPropsWithNavbarOverride, ColorTheme } from "../additional";
import { ThemeProvider, createTheme, CssBaseline, Grid } from "@mui/material";
import App from "next/app";
import initAuth from "./initAuth";

initAuth();

const defaultTheme = createTheme({
    palette: {
        mode: "light",
    },
});
const themes = {
    dark: createTheme({
        palette: {
            mode: "dark",
        },
    }),
    light: defaultTheme,
    system: defaultTheme,
};

const lsThemeKey = "ColorThemeString";
const lsWatchSystemKey = "WatchSystemThemeBoolean";
const themeValues: ColorTheme[] = ["light", "dark", "system"];

type AppState = {
    themeMode: ColorTheme;
    watchSystemTheme: boolean;
};

export default class MyApp extends App<
    AppPropsWithNavbarOverride,
    {},
    AppState
> {
    state: Readonly<AppState> = {
        themeMode: "light",
        watchSystemTheme: false,
    };

    componentDidMount() {
        this.systemThemeMediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        let lsTheme = localStorage.getItem(lsThemeKey) as ColorTheme;
        if (!lsTheme || !themeValues.includes(lsTheme)) {
            lsTheme = "light";
        }

        const lsSystemS = localStorage.getItem(lsWatchSystemKey);
        const lsSystem = lsSystemS == "true" ? true : false;

        this.setState({
            themeMode: lsTheme,
            watchSystemTheme: lsSystem,
        });
    }

    componentDidUpdate() {
        localStorage.setItem(lsThemeKey, this.state.themeMode);
        localStorage.setItem(
            lsWatchSystemKey,
            String(this.state.watchSystemTheme)
        );
        this.state.themeMode === "system"
            ? this.enableSystemTheme()
            : this.disableSystemTheme();
    }

    systemThemeMediaQuery!: MediaQueryList;
    enableSystemTheme() {
        // Set up event listener
        if (!this.systemThemeMediaQuery.onchange) {
            this.systemThemeMediaQuery.onchange = ({ matches: isDark }) => {
                themes.system = isDark ? themes.dark : themes.light;
            };
            this.setState({ watchSystemTheme: true });
        }

        // Do a manual check to make sure it system theme is set correctly
        if (this.systemThemeMediaQuery.matches) {
            if (themes.system !== themes.dark) {
                themes.system = themes.dark;
                this.setState({ themeMode: "system" });
            }
        } else {
            if (themes.system !== themes.light) {
                themes.system = themes.light;
                this.setState({ themeMode: "system" });
            }
        }
    }

    disableSystemTheme() {
        // Remove event listener
        if (this.systemThemeMediaQuery.onchange) {
            this.systemThemeMediaQuery.onchange = null;
            this.setState({ watchSystemTheme: false });
            console.log("Theme watching disabled");
        }
    }

    render() {
        const { Component, pageProps } = this.props;
        const setTheme = (theme: ColorTheme) => {
            this.setState({ themeMode: theme });
        };

        if (!Component.isOverridingNavbar) {
            return (
                <ThemeProvider theme={themes[this.state.themeMode]}>
                    <CssBaseline />
                    <Navbar setTheme={setTheme} />
                    <main>
                        <Component {...pageProps} />
                    </main>
                </ThemeProvider>
            );
        } else {
            pageProps.setTheme = setTheme;
            return (
                <ThemeProvider theme={themes[this.state.themeMode]}>
                    <CssBaseline />
                    <Component {...pageProps} />
                </ThemeProvider>
            );
        }
    }
}
