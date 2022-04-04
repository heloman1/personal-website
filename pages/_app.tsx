import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { AppPropsWithNavbarOverride, ColorTheme } from "../utils/types";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "next/app";
import { ThemeControlContext } from "components/ThemeControlContext";

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
    theme: ColorTheme;
    watchSystemTheme: boolean;
};

export default class MyApp extends App<
    AppPropsWithNavbarOverride,
    {},
    AppState
> {
    state: Readonly<AppState> = {
        theme: "light",
        watchSystemTheme: false,
    };

    componentDidMount() {
        this.systemThemeMediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        let lsTheme = localStorage.getItem(lsThemeKey) as ColorTheme;
        if (!lsTheme || !themeValues.includes(lsTheme)) {
            lsTheme = "system";
        }

        const lsSystemS = localStorage.getItem(lsWatchSystemKey);
        const lsSystem = lsSystemS == "true" ? true : false;

        this.setState({
            theme: lsTheme,
            watchSystemTheme: lsSystem,
        });
    }

    componentDidUpdate() {
        localStorage.setItem(lsThemeKey, this.state.theme);
        localStorage.setItem(
            lsWatchSystemKey,
            String(this.state.watchSystemTheme)
        );
        this.state.theme === "system"
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
                this.setState({ theme: "system" });
            }
        } else {
            if (themes.system !== themes.light) {
                themes.system = themes.light;
                this.setState({ theme: "system" });
            }
        }
    }

    disableSystemTheme() {
        // Remove event listener
        if (this.systemThemeMediaQuery.onchange) {
            this.systemThemeMediaQuery.onchange = null;
            this.setState({ watchSystemTheme: false });
        }
    }

    render() {
        const { Component, pageProps } = this.props;
        const setTheme = (theme: ColorTheme) => {
            this.setState({ theme: theme });
        };

        if (!Component.isOverridingNavbar) {
            return (
                <ThemeControlContext.Provider
                    value={{ theme: this.state.theme, setTheme }}
                >
                    <ThemeProvider theme={themes[this.state.theme]}>
                        <CssBaseline />
                        <Navbar theme={this.state.theme} setTheme={setTheme} />
                        <main>
                            <Component {...pageProps} />
                        </main>
                    </ThemeProvider>
                </ThemeControlContext.Provider>
            );
        } else {
            pageProps.setTheme = setTheme;
            pageProps.theme = this.state.theme;
            return (
                <ThemeControlContext.Provider
                    value={{ theme: this.state.theme, setTheme }}
                >
                    <ThemeProvider theme={themes[this.state.theme]}>
                        <CssBaseline />
                        <Component {...pageProps} />
                    </ThemeProvider>
                </ThemeControlContext.Provider>
            );
        }
    }
}

const firebaseClientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID,
};
export { MyApp, firebaseClientConfig };
