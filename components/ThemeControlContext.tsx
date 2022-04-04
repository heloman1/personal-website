import { createContext } from "react";
import { ColorTheme } from "utils/types";

type ThemeContextType = {
    setTheme: (theme: ColorTheme) => void;
    theme: ColorTheme;
};

export const ThemeControlContext = createContext<ThemeContextType>({
    setTheme: () => {},
    theme: "light",
});

