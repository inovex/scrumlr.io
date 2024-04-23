import {Color} from "constants/colors";

export const FONT_COLOR = "#f9fafb";

export const BG_COLOR_DEFAULT = "#888888";
export const BG_COLOR_LIGHT = "#666666";

export const getColorFromName = (name: Color): string => {
  switch (name) {
    case "grooming-green": {
      return "#18d8ab";
    }
    case "goal-green": {
      return "#70e000";
    }
    case "lean-lilac": {
      return "#c000ff";
    }
    case "online-orange": {
      return "#ffaa5a";
    }
    case "planning-pink": {
      return "#e20360";
    }
    case "poker-purple": {
      return "#5e00ff";
    }
    case "retro-red": {
      return "#ea434b";
    }
    case "warning-red": {
      return "#eb625b";
    }
    default: {
      return "#0057ff";
    }
  }
};
