import { createContext } from "react";

type NavbarContextType = {
    setNavbarButtons: (buttons: JSX.Element) => void;
};

export const NavbarContext = createContext<NavbarContextType>({
    setNavbarButtons: () => {},
});
