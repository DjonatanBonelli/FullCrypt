import cyan from "./colors/cyan";
import darkPurple from "./colors/dark-purple";
import purple from "./colors/purple";

export const themes = {
  darkPurple,
  cyan,
};

export type ThemeName = keyof typeof themes;
