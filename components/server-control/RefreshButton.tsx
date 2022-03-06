import type { NextPage } from "next";
import styles from "../../styles/SpinKeyframes.module.css";
import { Button } from "@mui/material";
import { Cached } from "@mui/icons-material";

type RefreshButtonProps = {
    state: {
        loading: boolean;
        isSignedIn: boolean;
        refreshData: () => Promise<void>;
    };
};

const RefreshButton: NextPage<RefreshButtonProps> = ({
    state: { isSignedIn, loading, refreshData },
}) => {
    return (
        <Button
            disabled={loading || !isSignedIn}
            onClick={refreshData}
            color="inherit"
            variant="outlined"
        >
            <Cached className={loading ? styles.spin : ""} />
        </Button>
    );
};

export default RefreshButton;
