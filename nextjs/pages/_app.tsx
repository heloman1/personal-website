import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { AppPropsWithLayoutOverride } from "../additional";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
    palette: {
        mode: "dark",
    },
});

function MyApp({ Component, pageProps }: AppPropsWithLayoutOverride) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {Component.NavbarOverride ? Component.NavbarOverride() : <Navbar />}
            <main>
                <Component {...pageProps} />
            </main>
        </ThemeProvider>
    );
}

export default MyApp;
