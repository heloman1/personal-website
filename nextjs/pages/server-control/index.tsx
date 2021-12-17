import { Cached } from "@mui/icons-material";
import { Button, ButtonGroup, Grid, Typography } from "@mui/material";
import styles from "../../styles/ServerControl.module.css";
import Link from "next/link";
import { Component } from "react";
import type { ColorTheme, ServerStatusesWithDisabled } from "../../additional";
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
};

export default class ServerControl extends Component<
    ServerControlProps,
    ServerControlState
> {
    // So _app.tsx doesnt create a navbar
    static isOverridingNavbar: Readonly<boolean> = true;
    state: Readonly<ServerControlState> = {
        serverData: {},
        loading: false,
    };

    doButtonAction(
        game: string,
        server: string,
        action: "start" | "stop" | "restart"
    ): void {
        this.sendCommand(game, server, action);
    }

    async sendCommand(
        game: string,
        server: string,
        action: "start" | "stop" | "restart"
    ) {
        this.setState({ loading: true });
        let res: Response;
        try {
            res = await fetch(
                `api/server-control/servers/${game}/${server}/${action}`,
                {
                    method: "POST",
                    signal: this.fetchAborter.signal,
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
                this.setState({ serverData, loading: false });
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
        this.setState({ loading: false });
        throw errorText;
    }
    async refreshData() {
        // serverData doesn't actually have disabled keys on it yet
        // This is done so Typescript doesn't get in the way...
        this.setState({ loading: true });
        // : ServerStatusesWithDisabled
        let res: Response;
        try {
            res = await fetch("/api/server-control/servers", {
                signal: this.fetchAborter.signal,
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
                this.setState({ serverData, loading: false });
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
        this.setState({ loading: false });
        throw errorText;
    }

    // Will abort on unmount
    private fetchAborter = new AbortController();
    componentDidMount() {
        // On mount, automatically grab data
        this.refreshData();
    }

    componentWillUnmount() {
        try {
            this.fetchAborter.abort();
        } catch (e) {
            // console.log("Fetch Aborted");
        }
    }

    render() {
        return (
            <>
                <Navbar theme={this.props.theme} setTheme={this.props.setTheme}>
                    <ButtonGroup>
                        {/* Refresh Button */}
                        <Button
                            disabled={this.state.loading}
                            onClick={this.refreshData.bind(this)}
                            color="inherit"
                            variant="outlined"
                        >
                            <Cached
                                className={
                                    this.state.loading ? styles.spin : ""
                                }
                            />
                        </Button>

                        <Button color="inherit" variant="outlined">
                            <Link href="/server-control/login">Login</Link>
                        </Button>
                    </ButtonGroup>
                </Navbar>
                <main>
                    {/* Server Data Display Grid */}
                    <Grid container paddingLeft=".5rem" paddingRight=".5rem">
                        {Object.keys(this.state.serverData).map((game, id) => (
                            <Grid container item key={id} spacing={2}>
                                {/* Title (uses 12 to take up entire line) */}
                                <Grid item xs={12} marginTop="1rem">
                                    <Typography variant="h4">{game}</Typography>
                                </Grid>
                                {Object.keys(this.state.serverData[game]).map(
                                    (server, id) => {
                                        const { is_online, port, disabled } =
                                            this.state.serverData[game][server];
                                        return (
                                            // Server Card
                                            <Grid item key={id} xs={2}>
                                                <GameServerCard
                                                    setServerData={this.doButtonAction.bind(
                                                        this
                                                    )}
                                                    serverProps={{
                                                        disabled:
                                                            this.state
                                                                .loading ||
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
    }
}
