// Used by server control to display a navbar with different links
import type { ReactElement, ReactNode, Dispatch, SetStateAction } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

/**
 * An object containing a single server's data.
 *
 * Expected to be used as an ExpectedJSONData[]
 */
export type ShellQueryData = {
    gameFolderName: string;
    server: string;
    details_string: string;
};

export type ColorTheme = "light" | "dark" | "system";


export type ButtonActions = (
    game: string,
    server: string,
    action: "start" | "stop" | "restart"
) => void;

export type ServerStatuses = {
    [game: string]: {
        [server: string]: {
            is_online: boolean;
            port: number;
        };
    };
};

export type ServerStatusesWithDisabled = ServerStatuses & {
    [game: string]: {
        [server: string]: {
            disabled: boolean;
        };
    };
};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_FIREBASE_PROJ_ID: string;
            FIREBASE_ADMIN_CLIENT_EMAIL: string;
            FIREBASE_ADMIN_PRIVATE_KEY: string;
            NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY: string;
            NEXT_PUBLIC_FIREBASE_CLIENT_AUTH_DOMAIN: string;
            SSH_HOST: string;
            DOMAIN_NAME: string;
        }
    }
}

type Milliseconds = number;
type ServerHandlerState = {
    serverDataCache: ServerStatuses;
    commandState: {
        isCommanding: boolean;
    };
    dataQueryState: {
        deferredResList: (() => any)[];
        isQuerying: boolean;
        lastRevalidate: number;
        waitTime: Milliseconds;
    };
};
