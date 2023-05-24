import { AlertColor, ButtonGroup } from "@mui/material";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
    ColorTheme,
    ServerStatusesWithDisabled,
} from "../../../utils/types";
import Navbar from "../../../components/Navbar";

import RefreshButton from "components/server-control/RefreshButton";
import NotifSnackBar from "components/server-control/NotifSnackbar";
import DisplayGrid from "components/server-control/DisplayGrid";
import { NextPage } from "next";
import { NavbarContext } from "components/NavbarContext";

async function wait(ms: number) {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res();
        }, ms);
    });
}

function enforceUsedPorts(serverData: ServerStatusesWithDisabled) {
    const usedPorts = new Set<number>();
    Object.keys(serverData).map((game) => {
        Object.keys(serverData[game]).map((server) => {
            if (serverData[game][server].is_online) {
                // If the server is online, remember the used port
                usedPorts.add(serverData[game][server].port);
                serverData[game][server].disabled = false;
            }
        });
    });

    // It is important that disabled keys are set on every entry
    // Since due to Typescript shenanigans, they're not actually guaranteed to
    // be here...
    Object.keys(serverData).map((game) => {
        Object.keys(serverData[game]).map((server) => {
            if (
                !serverData[game][server].is_online &&
                usedPorts.has(serverData[game][server].port)
            ) {
                serverData[game][server].disabled = true;
            } else {
                serverData[game][server].disabled = false;
            }
        });
    });
    // ... until now
}

type ServerControlProps = {
    setTheme: (theme: ColorTheme) => void;
    theme: ColorTheme;
};

type ServerControlDemoState = {
    serverData: ServerStatusesWithDisabled;
    loading: boolean;
    snackbarIsOpen: boolean;
    snackbarMessage: string;
    snackbarSeverity: AlertColor;
};

const ServerControlDemo: NextPage<ServerControlProps> = (props) => {
    const { setNavbarButtons: setButtons } = useContext(NavbarContext);
    const [state, setState] = useState<ServerControlDemoState>({
        loading: false,
        serverData: {
            "Service A": {
                "Instance 1": {
                    disabled: false,
                    is_online: true,
                    port: 6543,
                },
                "Instance 2": {
                    disabled: false,
                    is_online: false,
                    port: 6544,
                },
                "Instance 3": {
                    disabled: false,
                    is_online: false,
                    port: 6545,
                },
                "Instance 4": {
                    disabled: false,
                    is_online: false,
                    port: 6546,
                },
            },
            "Service b": {
                "Inst. w/ shared port": {
                    disabled: false,
                    is_online: true,
                    port: 7777,
                },
                "Inst. 2 w/ shared port": {
                    disabled: false,
                    is_online: false,
                    port: 7777,
                },
            },
        },
        snackbarIsOpen: false,
        snackbarMessage: "",
        snackbarSeverity: "info",
    });

    const fetchAborter = useMemo(() => new AbortController(), []);

    const showSnackbar = useCallback(
        (message: string, severity?: AlertColor) => {
            setState((state) => {
                return {
                    ...state,
                    snackbarIsOpen: true,
                    snackbarMessage: message,
                    snackbarSeverity: severity || "info",
                };
            });
        },
        [setState]
    );
    const hideSnackbar = useCallback(() => {
        setState((s) => {
            return { ...s, snackbarIsOpen: false };
        });
    }, [setState]);

    // Don't use useCallback here, it skips a rerender if you do that
    const sendCommand = async (
        game: string,
        server: string,
        action: "start" | "stop" | "restart"
    ) => {
        setState((s) => {
            return { ...s, loading: true };
        });

        await wait(2000);

        setState((s) => {
            const newStatuses = {
                ...s.serverData,
            };

            newStatuses[game][server].is_online =
                action === "start" || action === "restart" ? true : false;

            enforceUsedPorts(newStatuses);
            return { ...s, serverData: newStatuses };
        });

        setState((s) => {
            return { ...s, loading: false };
        });
    };

    const refreshData = useCallback(async () => {
        setState((s) => {
            return { ...s, loading: true };
        });
        await wait(2000);
        setState((s) => {
            return { ...s, loading: false };
        });
    }, []);

    // Stop ongoing fetches when leaving the page
    useEffect(
        () => () => {
            try {
                fetchAborter.abort();
            } catch (e) {
                // console.log("Fetch Aborted");
            }
        },
        [fetchAborter]
    );

    // on mount
    useEffect(() => {
        setButtons(
            <ButtonGroup>
                <RefreshButton
                    disabled={state.loading}
                    spinning={state.loading}
                    refreshData={refreshData}
                />
            </ButtonGroup>
        );
        return () => {
            setButtons(<></>);
        };
    }, [refreshData, setButtons, state.loading]);

    return (
        <main>
            <NotifSnackBar hideSnackbar={hideSnackbar} state={state} />

            <DisplayGrid sendCommand={sendCommand} state={state} />
        </main>
    );
};

export default ServerControlDemo;
