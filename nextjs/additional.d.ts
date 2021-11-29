// Used by server control to display a navbar with different links
import type { ReactElement, ReactNode, Dispatch, SetStateAction } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

type ColorTheme = "light" | "dark" | "system";

type NextPageWithLayoutOverride<P = {}, IP = P> = NextPage<P, IP> & {
    NavbarExtraButtons?: JSX.Element;
};
type AppPropsWithLayoutOverride = AppProps & {
    Component: NextPageWithLayoutOverride;
};

type ButtonActions = (
    game: string,
    server: string,
    action: "start" | "stop" | "restart"
) => void;

type ServerStatuses = {
    [game: string]: {
        [server: string]: {
            is_online: boolean;
            port: number;
        };
    };
};

type ServerStatusesWithDisabled = ServerStatuses & {
    [game: string]: {
        [server: string]: {
            disabled: boolean;
        };
    };
};
