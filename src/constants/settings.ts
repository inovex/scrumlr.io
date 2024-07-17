import {ComponentType, SVGProps} from "react";
import {GeneralSettings, Participants, SettingsAppearance, SettingsFeedback, Share, FileDefault} from "components/Icon";
import {Color} from "./colors";

export const MOBILE_BREAKPOINT = 920;

export type MenuKey = "board" | "participants" | "appearance" | "share" | "export" | "feedback" | "profile";

type LocalizationKey = "BoardSettings" | "Participants" | "Appearance" | "ShareSession" | "ExportBoard" | "Feedback" | "Profile";

export type MenuItem = {
  localizationKey: LocalizationKey;
  location: string;
  isModeratorOnly: boolean;
  color: Color;
  icon: ComponentType<SVGProps<SVGSVGElement>> | "profile"; // profile: special case
};

export type MenuEntry = {key: MenuKey; value: MenuItem};

export const MENU_ITEMS: Record<MenuKey, MenuItem> = {
  board: {
    localizationKey: "BoardSettings",
    location: "board",
    isModeratorOnly: true,
    color: "backlog-blue",
    icon: GeneralSettings,
  },
  participants: {
    localizationKey: "Participants",
    location: "participants",
    isModeratorOnly: false,
    color: "poker-purple",
    icon: Participants,
  },
  appearance: {
    localizationKey: "Appearance",
    location: "appearance",
    isModeratorOnly: false,
    color: "value-violet",
    icon: SettingsAppearance,
  },
  share: {
    localizationKey: "ShareSession",
    location: "share",
    isModeratorOnly: false,
    color: "planning-pink",
    icon: Share,
  },
  export: {
    localizationKey: "ExportBoard",
    location: "export",
    isModeratorOnly: false,
    color: "backlog-blue",
    icon: FileDefault,
  },
  feedback: {
    localizationKey: "Feedback",
    location: "feedback",
    isModeratorOnly: false,
    color: "poker-purple",
    icon: SettingsFeedback,
  },
  profile: {
    localizationKey: "Profile",
    location: "profile",
    isModeratorOnly: false,
    color: "value-violet",
    icon: "profile",
  },
};

// shorthand to enable all menu items
export const ENABLE_ALL: Record<MenuKey, boolean> = {
  board: true,
  participants: true,
  appearance: true,
  share: true,
  export: true,
  feedback: true,
  profile: true,
};
