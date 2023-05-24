import { Auth } from "firebase/auth";
import type { NextPage } from "next";
import { Button, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { GameServerCard } from "./GameServerCard";
import { ServerStatusesWithDisabled } from "utils/types";

type DisplayGridProps = {
    sendCommand: (
        game: string,
        server: string,
        action: "start" | "stop" | "restart"
    ) => Promise<void>;
    state: {
        serverData: ServerStatusesWithDisabled;
        loading: boolean;
    };
};

const DisplayGrid: NextPage<DisplayGridProps> = ({
    sendCommand,
    state: { serverData, loading },
}) => {
    return (
        <Grid container paddingLeft=".5rem" paddingRight=".5rem">
            {Object.keys(serverData).map((game, id) => (
                <Grid container item key={id} spacing={2}>
                    {/* Title (uses 12 to take up entire line) */}
                    <Grid item xs={12} marginTop="1rem">
                        <Typography variant="h4">{game}</Typography>
                    </Grid>
                    {Object.keys(serverData[game]).map((server, id) => {
                        const { is_online, port, disabled } =
                            serverData[game][server];
                        return (
                            // Server Card
                            <Grid item key={id} xs={12} sm={6} md={3} lg={2}>
                                <GameServerCard
                                    setServerData={sendCommand}
                                    serverProps={{
                                        disabled: loading || disabled,
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
            ))}
        </Grid>
    );
};

export default DisplayGrid;
