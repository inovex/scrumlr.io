const colors = ["backlog-blue", "grooming-green", "lean-lilac", "online-orange", "planning-pink", "poker-purple", "retro-red"] as const;
export type Color = typeof colors[number];

export function isOfTypeColor(input: string): input is Color {
  return (colors as readonly string[]).includes(input);
}

export default Color;
