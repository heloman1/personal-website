import { PropsWithChildren } from "react";
import { ButtonGroup, IconButton } from "@mui/material";
import {
    Computer,
    ComputerTwoTone,
    DarkMode,
    DarkModeOutlined,
    LightMode,
    LightModeOutlined,
} from "@mui/icons-material";
import { ColorTheme } from "../utils/types";

type NavbarProps = PropsWithChildren<{
    setTheme: (theme: ColorTheme) => void;
    theme: ColorTheme;
}>;

export default function ThemeControl({ theme, setTheme }: NavbarProps) {
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
