import { Circle } from "@mui/icons-material";
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
} from "@mui/material";
import { NextPage } from "next";
import { ButtonActions } from "../additional";

export const GameServerCard: NextPage<{
    setServerData: ButtonActions;
    serverProps: {
        game: string;
        server: string;
        is_online: boolean;
        port: number;
        disabled: boolean;
    };
}> = ({ setServerData, serverProps }) => {
    const { game, server, is_online, port, disabled } = serverProps;
    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h5"
                    sx={{ display: "flex", justifyContent: "space-between" }}
                >
                    <span>{server}</span>
                    <Circle
                        color={
                            disabled
                                ? "disabled"
                                : is_online
                                ? "success"
                                : "error"
                        }
                    />
                </Typography>

                <Typography variant="body1">Port: {port}</Typography>
            </CardContent>
            <CardActions>
                <Button
                    disabled={disabled}
                    variant="contained"
                    color={is_online ? "error" : "success"}
                    onClick={() => {
                        setServerData(
                            game,
                            server,
                            is_online ? "stop" : "start"
                        );
                    }}
                >
                    {is_online ? "Stop" : "Start"}
                </Button>
                <Button
                    disabled={disabled || !is_online}
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                        setServerData(game, server, "restart");
                    }}
                >
                    Restart
                </Button>
            </CardActions>
        </Card>
    );
};
