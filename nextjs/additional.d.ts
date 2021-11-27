// Used by server control to display a navbar with different links
import type { ReactElement, ReactNode, Dispatch, SetStateAction } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

export type ThemeMode = "light" | "dark" | "system";

export type NextPageWithLayoutOverride = NextPage & {
    NavbarExtraButtons?: JSX.Element;
};
export type AppPropsWithLayoutOverride = AppProps & {
    Component: NextPageWithLayoutOverride;
};
