import type { NextPage } from "next";
import styles from "../../styles/SpinKeyframes.module.css";
import { Button } from "@mui/material";
import { Cached } from "@mui/icons-material";

type RefreshButtonProps = {
    disabled: boolean;
    spinning: boolean;
    refreshData: () => Promise<void>;
};

const RefreshButton: NextPage<RefreshButtonProps> = ({
    disabled,
    spinning,
    refreshData,
}) => {
    return (
        <Button
            disabled={disabled}
            onClick={refreshData}
            color="inherit"
            variant="outlined"
        >
            <Cached className={spinning ? styles.spin : ""} />
        </Button>
    );
};

export default RefreshButton;
