import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { ColorTheme } from "../utils/types";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ThemeControlContext } from "components/ThemeControlContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppProps } from "next/app";

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

const lStorageThemeKey = "ColorThemeString";
const lStorageRespectSystemKey = "WatchSystemThemeBoolean";

type ThemeState = {
    theme: ColorTheme;
    respectSystem: boolean;
};

export default function MyApp({ Component, pageProps }: AppProps) {
    // theme tells React what the current theme is
    // respectSystem tells React whether to automatically switch

    // Both are neccesary, without respectSystem:
    // if daytime && theme == "system", then user switches from system to light,
    // it would trigger an uneccesary rerender
    // Also, if extra themes were to be added later
    // (i.e. "purple-light", "purple-dark", etc.), respectSystem would
    // legitimately be required
    const [themeState, setThemeState] = useState<ThemeState>({
        theme: "light",
        respectSystem: false,
    });

    const systemThemeMediaQuery = useRef<MediaQueryList>();

    const matchSystem = useCallback((bool: boolean) => {
        if (!systemThemeMediaQuery.current) {
            throw "You managed to enableSystemTheme before the window was loaded. How???";
        }
        if (bool) {
            // Set up event listener
            if (!systemThemeMediaQuery.current.onchange) {
                systemThemeMediaQuery.current.onchange = ({
                    matches: isDark,
                }) => {
                    themes.system = isDark ? themes.dark : themes.light;
                };
                setThemeState((s) => {
                    return { ...s, respectSystem: true };
                });
            }

            // Do a manual check to make sure it system theme is set correctly
            if (systemThemeMediaQuery.current.matches) {
                if (themes.system !== themes.dark) {
                    themes.system = themes.dark;
                    setThemeState((s) => {
                        return { ...s, theme: "system" };
                    });
                }
            } else {
                if (themes.system !== themes.light) {
                    themes.system = themes.light;
                    setThemeState((s) => {
                        return { ...s, theme: "system" };
                    });
                }
            }
        } else {
            // Remove event listener
            if (systemThemeMediaQuery.current.onchange) {
                systemThemeMediaQuery.current.onchange = null;
                setThemeState((s) => {
                    return { ...s, respectSystem: false };
                });
            }
        }
    }, []);

    // on mount
    useEffect(() => {
        systemThemeMediaQuery.current = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );
        let lStorageTheme = localStorage.getItem(
            lStorageThemeKey
        ) as ColorTheme;
        if (!lStorageTheme /*|| !themeValues.includes(lStorageTheme)*/) {
            lStorageTheme = "system";
        }

        const lStorageRespectSystem =
            localStorage.getItem(lStorageRespectSystemKey) == "true"
                ? true
                : false;

        setThemeState({
            theme: lStorageTheme,
            respectSystem: lStorageRespectSystem,
        });
    }, []);

    // on themeState changed
    useEffect(() => {
        console.log("Theme Changed!");
        console.log("Writing to local storage!");

        localStorage.setItem(lStorageThemeKey, themeState.theme);
        localStorage.setItem(
            lStorageRespectSystemKey,
            String(themeState.respectSystem)
        );
        matchSystem(themeState.theme === "system");
    }, [matchSystem, themeState]);

    const setTheme = useCallback((theme: ColorTheme) => {
        setThemeState((s) => {
            return { ...s, theme: theme };
        });
    }, []);

    return (
        <ThemeControlContext.Provider
            value={{ theme: themeState.theme, setTheme }}
        >
            <ThemeProvider theme={themes[themeState.theme]}>
                <CssBaseline />
                <Navbar>
                    <main>
                        <Component {...pageProps} />
                    </main>
                </Navbar>
            </ThemeProvider>
        </ThemeControlContext.Provider>
    );
}

const firebaseClientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID,
};
export { MyApp, firebaseClientConfig };
