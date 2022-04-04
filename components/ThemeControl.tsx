import { useContext } from "react";
import { ButtonGroup, IconButton } from "@mui/material";
import {
    Computer,
    ComputerTwoTone,
    DarkMode,
    DarkModeOutlined,
    LightMode,
    LightModeOutlined,
} from "@mui/icons-material";
import { ThemeControlContext } from "./ThemeControlContext";

export default function ThemeControl() {
    const { theme, setTheme } = useContext(ThemeControlContext);

    return (
        <ButtonGroup variant="contained">
            <IconButton
                onClick={() => {
                    setTheme("dark");
                }}
            >
                {theme === "dark" ? <DarkMode /> : <DarkModeOutlined />}
            </IconButton>
            <IconButton
                onClick={() => {
                    setTheme("system");
                }}
            >
                {theme === "system" ? <ComputerTwoTone /> : <Computer />}
            </IconButton>
            <IconButton
                onClick={() => {
                    setTheme("light");
                }}
            >
                {theme === "light" ? <LightMode /> : <LightModeOutlined />}
            </IconButton>
        </ButtonGroup>
    );
}
