import { Button, Grid } from "@mui/material";

import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
    ButtonActions,
    NextPageWithLayoutOverride,
    ServerStatusesWithDisabled,
} from "../../additional";
import { GameServerCard } from "../../components/GameServerCard";

async function fetchData(
    setServerData: Dispatch<SetStateAction<ServerStatusesWithDisabled>>
) {
    // serverData doesn't actually have disabled keys on it
    // This is done so Typescript doesn't get in the way...
    const serverData: ServerStatusesWithDisabled = await (
        await fetch("/api/gameQuery")
    ).json();

    // ...when I add them here
    const usedPorts = new Set<number>();
    Object.keys(serverData).map((game) => {
        Object.keys(serverData[game]).map((server) => {
            if (serverData[game][server].is_online) {
                // If the server is online, remember the used port
                usedPorts.add(serverData[game][server].port);
            } else if (usedPorts.has(serverData[game][server].port)) {
                // If offline, disable the button if the port is in use
                serverData[game][server].disabled = true;
            } else {
                serverData[game][server].disabled = false;
            }
        });
    });
    setServerData(serverData);
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
        setServerData({ ...serverData });
    };
}

const ServerControl: NextPageWithLayoutOverride<{ data: number }> = () => {
    let [serverData, setServerData] = useState<ServerStatusesWithDisabled>({});
    const buttonActions = makeButtonActions(serverData, setServerData);
    useEffect(() => {
        fetchData(setServerData);
    }, []);
    return (
        <Grid container>
            {Object.keys(serverData).map((game, id) => {
                return (
                    <Grid container item key={id} spacing={2}>
                        <Grid item xs={12}>
                            <p>{game}</p>
                        </Grid>

                        {Object.keys(serverData[game]).map((server, id) => {
                            const { is_online, port, disabled } =
                                serverData[game][server];
                            return (
                                <Grid item key={id} xs={2}>
                                    <GameServerCard
                                        setServerData={buttonActions}
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
                        })}
                    </Grid>
                );
            })}
        </Grid>
    );
};

ServerControl.NavbarExtraButtons = (
    <Button color="inherit" variant="outlined">
        <Link href="/server-control/login">Login</Link>
    </Button>
);

export default ServerControl;
