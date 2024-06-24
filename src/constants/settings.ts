import {ComponentType, SVGProps} from "react";
import {GeneralSettings, Participants, SettingsAppearance, SettingsFeedback, Share, FileDefault} from "components/Icon";
import {Color} from "./colors";

type LocalizationKey = "BoardSettings" | "Participants" | "Appearance" | "ShareSession" | "ExportBoard" | "Feedback";

export type MenuItem = {
  localizationKey: LocalizationKey;
  location: string;
  isModeratorOnly: boolean;
  color: Color;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const MENU_ITEMS: Record<string, MenuItem> = {
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
    color: "lean-lilac",
    icon: SettingsAppearance,
  },
  share: {
    localizationKey: "ShareSession",
    location: "share",
    isModeratorOnly: false,
    color: "planning-pink",
    icon: Share,
  },
  exportBoard: {
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
};
