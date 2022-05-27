import { createContext } from "react";

const DropdownContext = createContext<DropdownContext>({
  dismissMenu: () => {
    throw new Error("No DropdownContext provider found");
  },
});

export default DropdownContext;

export interface DropdownContext {
  dismissMenu: () => void;
}
