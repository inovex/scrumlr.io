import {SkinTone} from "../store/features/skinTone/skinTone";

export const getEmojiWithSkinTone = (
  emoji: {
    emoji: string;
    skinToneSupported: boolean;
  },
  skinTone: SkinTone
) => (emoji.skinToneSupported ? emoji.emoji + skinTone.component : emoji.emoji);
