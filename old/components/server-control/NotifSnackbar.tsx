import { Auth } from "firebase/auth";
import type { NextPage } from "next";
import { Alert, AlertColor, Button, IconButton, Snackbar } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { Close } from "@mui/icons-material";

type NotifSnackBarProps = {
    autohideDuration?: number;
    state: {
        snackbarIsOpen: boolean;
        snackbarSeverity: AlertColor;
        snackbarMessage: string;
    };
    hideSnackbar: () => void;
};

const NotifSnackBar: NextPage<NotifSnackBarProps> = ({
    autohideDuration,
    state: { snackbarIsOpen, snackbarSeverity, snackbarMessage },
    hideSnackbar,
}) => {
    return (
        <Snackbar
            autoHideDuration={autohideDuration ? autohideDuration : 5000}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
            open={snackbarIsOpen}
            onClose={(_e, r) => {
                if (r == "timeout") {
                    hideSnackbar();
                }
            }}
        >
            <Alert
                sx={{ alignItems: "center" }}
                severity={snackbarSeverity}
                action={
                    <IconButton color="inherit" onClick={hideSnackbar}>
                        <Close color="inherit" />
                    </IconButton>
                }
            >
                {snackbarMessage}
            </Alert>
        </Snackbar>
    );
};

export default NotifSnackBar;
