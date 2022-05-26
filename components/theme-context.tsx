import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";

export enum Theme {
  LIGHT = "LIGHT",
  DARK = "DARK",
}

export enum ThemeSetting {
  LIGHT = "LIGHT",
  DARK = "DARK",
  AUTO = "AUTO",
}

export function ThemeProvider({
  children,
}: PropsWithChildren<{}>): ReactElement {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme(Theme.DARK);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
}

export const ThemeContext = createContext<ThemeContext>(
  null as unknown as ThemeContext
);

export function useThemeContext(): ThemeContext {
  return useContext(ThemeContext);
}

export interface ThemeContext {
  theme: Theme;
}
