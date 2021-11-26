import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Navbar";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Layout />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
