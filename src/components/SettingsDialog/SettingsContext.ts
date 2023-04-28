import {AvataaarProps} from "components/Avatar";
import {createContext} from "react";

export type SettingsContextData = {
  profile?: {
    unsavedAvatarChanges?: AvataaarProps;
  };
};

export const SettingsContext = createContext<{settings: SettingsContextData | undefined; updateSettings: (newSettings: SettingsContextData) => void}>({
  settings: {},
  updateSettings: () => {},
});
