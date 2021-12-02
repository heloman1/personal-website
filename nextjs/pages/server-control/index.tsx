import { Cached } from "@mui/icons-material";
import { Button, ButtonGroup, Grid } from "@mui/material";
import styles from "../../styles/ServerControl.module.css";
import Link from "next/link";
import { Component } from "react";
import {
    ButtonActions,
    ColorTheme,
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

function makeButtonActions(
    serverData: ServerStatusesWithDisabled,
    setServerData: (serverData: ServerStatusesWithDisabled) => void
): ButtonActions {
    return (
        game: string,
        server: string,
        action: "start" | "stop" | "restart"
    ) => {
        switch (action) {
            case "start":
            case "restart":
                serverData[game][server].is_online = true;
                break;
            case "stop":
                serverData[game][server].is_online = false;
                break;
            default:
                throw `Recieved unexpected action ${action}`;
        }
        enforceUsedPorts(serverData);

        setServerData({ ...serverData });
    };
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
    // So _app.tsx doesnt create a navbar, etc...
    static isOverridingNavbar: Readonly<boolean> = true;
    state: Readonly<ServerControlState> = {
        serverData: {},
        loading: false,
    };

    async fetchData(
        setServerData: (serverData: ServerStatusesWithDisabled) => void,
        signal: AbortSignal
    ) {
        // serverData doesn't actually have disabled keys on it yet
        // This is done so Typescript doesn't get in the way...
        this.setState({ loading: true });
        const serverData: ServerStatusesWithDisabled = await (
            await fetch("/api/gameData", { signal })
        ).json();
        this.setState({ loading: false });

        // serverData doesn't actually have disabled keys on it yet
        // This is done so Typescript doesn't get in the way
        // When enforceUsedPorts coincidentally adds them
        enforceUsedPorts(serverData);
        setServerData({ ...serverData });
    }
    fetchAborter = new AbortController();
    componentDidMount() {
        this.fetchData(
            (serverData) => this.setState({ serverData }),
            this.fetchAborter.signal
        );
    }
    componentWillUnmount() {
        return () => {
            try {
                this.fetchAborter.abort();
            } catch (e) {
                // console.log("Fetch Aborted");
            }
        };
    }
    render() {
        const buttonActions = makeButtonActions(
            this.state.serverData,
            (serverData) => this.setState({ serverData })
        );
        return (
            <>
                <Navbar theme={this.props.theme} setTheme={this.props.setTheme}>
                    <ButtonGroup>
                        {/* Refresh Button */}
                        <Button
                            onClick={() =>
                                this.fetchData(
                                    (serverData) =>
                                        this.setState({ serverData }),
                                    this.fetchAborter.signal
                                )
                            }
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
                    <Grid container>
                        {Object.keys(this.state.serverData).map((game, id) => (
                            <Grid container item key={id} spacing={2}>
                                {/* Title (uses 12 to take up entire line) */}
                                <Grid item xs={12}>
                                    <p>{game}</p>
                                </Grid>

                                {Object.keys(this.state.serverData[game]).map(
                                    (server, id) => {
                                        const { is_online, port, disabled } =
                                            this.state.serverData[game][server];
                                        return (
                                            // Server Card
                                            <Grid item key={id} xs={2}>
                                                <GameServerCard
                                                    setServerData={
                                                        buttonActions
                                                    }
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
