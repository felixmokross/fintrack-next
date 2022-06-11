export function isDarkTheme() {
  // theme can only be determined on client side
  return typeof window !== "undefined" && darkThemePreference().matches;
}

export function darkThemePreference() {
  if (typeof window === "undefined")
    throw new Error("darkThemePreference cannot be determined on server side");
  return window.matchMedia("(prefers-color-scheme: dark)");
}
