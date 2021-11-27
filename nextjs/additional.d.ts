// Used by server control to display a navbar with different links
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

export type NextPageWithLayoutOverride = NextPage & {
    NavbarOverride?: () => ReactNode;
};
export type AppPropsWithLayoutOverride = AppProps & {
    Component: NextPageWithLayoutOverride;
};
