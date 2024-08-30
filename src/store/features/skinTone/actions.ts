import {SkinToneName} from "types/skinTone";

export const SkinToneAction = {
  SetSkinTone: "scrumlr.io/setSkinTone" as const,
};

export const SkinToneActionFactory = {
  setSkinTone: (skinToneName: SkinToneName) => ({
    type: SkinToneAction.SetSkinTone,
    skinToneName,
  }),
};

export type SkinToneReduxAction = ReturnType<typeof SkinToneActionFactory.setSkinTone>;
