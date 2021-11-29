import { Card, CardContent, CardActions, Button } from "@mui/material";
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
                <p>{server}</p>
                <p>Port: {port}</p>
                <p>Online: {is_online ? "true" : "false"}</p>
            </CardContent>
            <CardActions>
                <Button
                    disabled={disabled}
                    variant="contained"
                    color={is_online ? "error" : "success"}
                    onClick={(e) => {
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
                    onClick={(e) => {
                        setServerData(game, server, "restart");
                    }}
                >
                    Restart
                </Button>
            </CardActions>
        </Card>
    );
};
