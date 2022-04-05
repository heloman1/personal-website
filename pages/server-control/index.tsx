import { AlertColor, ButtonGroup } from "@mui/material";
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ColorTheme, ServerStatusesWithDisabled } from "../../utils/types";

import { getAuth } from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";

import { firebaseClientConfig } from "../_app";
import LoginButton from "components/server-control/LoginButton";
import RefreshButton from "components/server-control/RefreshButton";
import NotifSnackBar from "components/server-control/NotifSnackbar";
import DisplayGrid from "components/server-control/DisplayGrid";
import { NextPage } from "next";
import { NavbarContext } from "components/NavbarContext";

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

type ServerControlState = {
    serverData: ServerStatusesWithDisabled;
    loading: boolean;
    snackbarIsOpen: boolean;
    snackbarMessage: string;
    snackbarSeverity: AlertColor;
    isSignedIn: boolean;
};

const ServerControl: NextPage<ServerControlProps> = (props) => {
    if (getApps().length === 0) initializeApp(firebaseClientConfig);
    const auth = useRef(getAuth());
    const [state, setState] = useState<ServerControlState>({
        loading: false,
        serverData: {},
        snackbarIsOpen: false,
        snackbarMessage: "",
        snackbarSeverity: "info",
        isSignedIn: false,
    });

    const { setNavbarButtons: setButtons } = useContext(NavbarContext);
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
        let res: Response;
        try {
            res = await fetch(
                `api/server-control/servers/${game}/${server}/${action}`,
                {
                    method: "POST",
                    signal: fetchAborter.signal,
                    headers: {
                        authorization: `Bearer ${await auth.current.currentUser?.getIdToken()}`,
                    },
                }
            );
        } catch (e) {
            console.log("Fetch was aborted. Did you navigate away?");
            return;
        }

        let errorText = "";
        switch (res.status) {
            case 200:
                const serverData: ServerStatusesWithDisabled = await res.json();

                // serverData doesn't actually have disabled keys on it yet
                // This is done so Typescript doesn't get in the way
                // When enforceUsedPorts coincidentally adds them
                enforceUsedPorts(serverData);
                setState((s) => {
                    return { ...s, serverData, loading: false };
                });
                showSnackbar("Command Successful", "success");
                return;
            case 405:
                errorText = `sendCommand sent a POST request and recieved ${res.status} - ${res.statusText}`;
                break;
            case 401:
                errorText =
                    "Unauthorized when sending command, are you signed in?";
                break;
            case 500:
                errorText = "Server error when doing sendCommand";
                break;
            case 503:
                errorText =
                    "Too fast! The server is currently handling a command";
                break;
            default:
                errorText = `Unexpected error ${res.status} - ${res.statusText}`;
                break;
        }
        showSnackbar(errorText, "error");
        setState((s) => {
            return { ...s, loading: false };
        });
        throw errorText;
    };

    const refreshData = useCallback(async () => {
        // serverData doesn't actually have disabled keys on it yet
        // This is done so Typescript doesn't get in the way...
        setState((s) => {
            return { ...s, loading: true };
        });
        // : ServerStatusesWithDisabled
        let res: Response;
        try {
            res = await fetch("/api/server-control/servers", {
                signal: fetchAborter.signal,
                headers: {
                    authorization: `Bearer ${await auth.current.currentUser?.getIdToken()}`,
                },
            });
        } catch (e) {
            console.log("Fetch was aborted. Did you navigate away?");
            return;
        }

        let errorText = "";
        switch (res.status) {
            case 200:
                const serverData: ServerStatusesWithDisabled = await res.json();

                // serverData doesn't actually have disabled keys on it yet
                // This is done so Typescript doesn't get in the way
                // When enforceUsedPorts coincidentally adds them
                enforceUsedPorts(serverData);
                console.log("Enforcing data");

                setState((s) => {
                    return { ...s, serverData, loading: false };
                });
                console.log("Data updated");
                return;
            case 405:
                errorText = `refreshData sent a GET request and recieved ${res.status} - ${res.statusText}`;
                break;
            case 401:
                errorText =
                    "Unauthorized when refreshing data, are you signed in?";
                break;
            case 500:
                errorText = "Server error when doing refreshData";
                break;
            default:
                errorText = `Unexpected error ${res.status} - ${res.statusText}`;
                break;
        }
        setState((s) => {
            return { ...s, loading: false };
        });
        throw errorText;
    }, [fetchAborter.signal, setState]);

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
    // One-time
    useEffect(() => {
        const unsub = auth.current.onAuthStateChanged((user) => {
            if (user) {
                setState((s) => {
                    return { ...s, isSignedIn: true };
                });
                refreshData();
                unsub();
            } else {
                setState((s) => {
                    return { ...s, isSignedIn: false };
                });
            }
        });
    }, [refreshData]);

    // on mount
    useEffect(() => {
        setButtons(
            <ButtonGroup>
                <RefreshButton
                    disabled={state.loading || !state.isSignedIn}
                    spinning={state.loading}
                    refreshData={refreshData}
                />
                <LoginButton firebaseAuth={auth.current} />
            </ButtonGroup>
        );
        return () => {
            setButtons(<></>);
        };
    }, [refreshData, setButtons, state.isSignedIn, state.loading]);

    return (
        <main>
            <NotifSnackBar hideSnackbar={hideSnackbar} state={state} />

            <DisplayGrid sendCommand={sendCommand} state={state} />
        </main>
    );
};

export default ServerControl;
