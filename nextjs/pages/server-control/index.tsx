import { Cached } from "@mui/icons-material";
import { Button, ButtonGroup, Grid } from "@mui/material";
import styles from "../../styles/ServerControl.module.css";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
    ButtonActions,
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

    // ...when I add them here, alongside enforcing used ports
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
}

async function fetchData(
    setServerData: Dispatch<SetStateAction<ServerStatusesWithDisabled>>
) {
    // serverData doesn't actually have disabled keys on it yet
    // This is done so Typescript doesn't get in the way...
    const serverData: ServerStatusesWithDisabled = await (
        await fetch("/api/gameData")
    ).json();

    enforceUsedPorts(serverData);

    setServerData({ ...serverData });
}

function makeButtonActions(
    serverData: ServerStatusesWithDisabled,
    setServerData: Dispatch<SetStateAction<ServerStatusesWithDisabled>>
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

// let loadingButtonState: [boolean, Dispatch<SetStateAction<boolean>>];
type ServerControlProps = {
    setTheme: (theme: ColorTheme) => void;
};
const ServerControl: NextPageWithNavbarOverride<ServerControlProps> = ({
    setTheme,
}) => {
    let [serverData, setServerData] = useState<ServerStatusesWithDisabled>({});
    let [loading, setLoading] = useState<boolean>(false);
    const buttonActions = makeButtonActions(serverData, setServerData);
    useEffect(() => {
        fetchData(setServerData);
    }, []);
    return (
        <>
            <Navbar setTheme={setTheme}>
                <ButtonGroup>
                    <Button
                        onClick={() => setLoading(!loading)}
                        color="inherit"
                        variant="outlined"
                    >
                        <Cached className={loading ? styles.spin : ""} />
                    </Button>
                    <Button color="inherit" variant="outlined">
                        <Link href="/server-control/login">Login</Link>
                    </Button>
                </ButtonGroup>
            </Navbar>
            <main>
                <Grid container>
                    {Object.keys(serverData).map((game, id) => {
                        return (
                            <Grid container item key={id} spacing={2}>
                                <Grid item xs={12}>
                                    <p>{game}</p>
                                </Grid>

                                {Object.keys(serverData[game]).map(
                                    (server, id) => {
                                        const { is_online, port, disabled } =
                                            serverData[game][server];
                                        return (
                                            <Grid item key={id} xs={2}>
                                                <GameServerCard
                                                    setServerData={
                                                        buttonActions
                                                    }
                                                    serverProps={{
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
                        );
                    })}
                </Grid>
            </main>
        </>
    );
};

ServerControl.isOverridingNavbar = true;

export default ServerControl;
