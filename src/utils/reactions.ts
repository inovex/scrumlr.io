import {SkinTone} from "../store/features/skinTone/types";

export const getEmojiWithSkinTone = (
  emoji: {
    emoji: string;
    skinToneSupported: boolean;
  },
  skinTone: SkinTone
) => (emoji.skinToneSupported ? emoji.emoji + skinTone.component : emoji.emoji);
// Format reaction users for tooltip: show all if ≤3, else first 2 + (+N) for remaining
export const formatReactionUsers = (users: {user: {name: string}}[]): string =>
  users.length <= 3 ? users.map((u) => u.user.name).join(", ") : `${users[0].user.name}, ${users[1].user.name}, (+${users.length - 2})`;
