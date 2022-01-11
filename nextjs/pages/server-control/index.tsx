import { Cached, Close } from "@mui/icons-material";
import {
    Alert,
    AlertColor,
    Button,
    ButtonGroup,
    Grid,
    IconButton,
    Snackbar,
    Typography,
} from "@mui/material";
import styles from "../../styles/ServerControl.module.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    ColorTheme,
    NextPageWithNavbarOverride,
    ServerStatusesWithDisabled,
} from "../../additional";
import { GameServerCard } from "../../components/GameServerCard";
import Navbar from "../../components/Navbar";

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
};

const ServerControl: NextPageWithNavbarOverride<ServerControlProps> = (
    props
) => {
    const [state, setState] = useState<ServerControlState>({
        loading: false,
        serverData: {},
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
        let res: Response;
        try {
            res = await fetch(
                `api/server-control/servers/${game}/${server}/${action}`,
                {
                    method: "POST",
                    signal: fetchAborter.signal,
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

    useEffect(() => {
        refreshData();
        // vvv Because onMount only vvv
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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
    return (
        <>
            <Navbar theme={props.theme} setTheme={props.setTheme}>
                <ButtonGroup>
                    {/* Refresh Button */}
                    <Button
                        disabled={state.loading}
                        onClick={refreshData}
                        color="inherit"
                        variant="outlined"
                    >
                        <Cached className={state.loading ? styles.spin : ""} />
                    </Button>

                    <Button color="inherit" variant="outlined">
                        <Link href="/server-control/login">Login</Link>
                    </Button>
                </ButtonGroup>
            </Navbar>
            <main>
                <Snackbar
                    autoHideDuration={5000}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                    open={state.snackbarIsOpen}
                    onClose={(_e, r) => {
                        if (r == "timeout") {
                            hideSnackbar();
                        }
                    }}
                >
                    <Alert
                        sx={{ alignItems: "center" }}
                        severity={state.snackbarSeverity}
                        action={
                            <IconButton color="inherit" onClick={hideSnackbar}>
                                <Close color="inherit" />
                            </IconButton>
                        }
                    >
                        {state.snackbarMessage}
                    </Alert>
                </Snackbar>
                {/* Server Data Display Grid */}
                <Grid container paddingLeft=".5rem" paddingRight=".5rem">
                    {Object.keys(state.serverData).map((game, id) => (
                        <Grid container item key={id} spacing={2}>
                            {/* Title (uses 12 to take up entire line) */}
                            <Grid item xs={12} marginTop="1rem">
                                <Typography variant="h4">{game}</Typography>
                            </Grid>
                            {Object.keys(state.serverData[game]).map(
                                (server, id) => {
                                    const { is_online, port, disabled } =
                                        state.serverData[game][server];
                                    return (
                                        // Server Card
                                        <Grid
                                            item
                                            key={id}
                                            xs={12}
                                            sm={6}
                                            md={3}
                                            lg={2}
                                        >
                                            <GameServerCard
                                                setServerData={sendCommand}
                                                serverProps={{
                                                    disabled:
                                                        state.loading ||
                                                        disabled,
                                                    game,
                                                    server,
                                                    is_online,
                                                    port,
                                                }}
                                            />
                                        </Grid>
                                    );
                                }
                            )}
                        </Grid>
                    ))}
                </Grid>
            </main>
        </>
    );
};

ServerControl.isOverridingNavbar = true;

export default ServerControl;
