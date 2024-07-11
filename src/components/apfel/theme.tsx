import {DefaultProperties, DefaultPropertiesProperties} from "@react-three/uikit";
import {Color, MeshPhongMaterial} from "three";

export class GlassMaterial extends MeshPhongMaterial {
  constructor() {
    super({
      specular: "#555",
      shininess: 100,
      opacity: 1,
    });
  }
}

function hsl(h: number, s: number, l: number) {
  return new Color().setHSL(h / 360, s / 100, l / 100, "srgb");
}

export const colors = {
  foreground: hsl(0, 0, 100),
  background: hsl(0, 0, 0),
  backgroundHover: hsl(0, 0, 10),
  card: hsl(0, 0, 53),
  cardForeground: hsl(0, 0, 100),
  cardHover: hsl(0, 0, 60),
  accent: hsl(210, 100, 52),
  accentForeground: hsl(0, 0, 100),
};

export const Defaults = (props: DefaultPropertiesProperties) => (
  <DefaultProperties scrollbarColor={colors.background} scrollbarBorderRadius={4} scrollbarOpacity={0.3} color={colors.background} fontWeight="medium" {...props} />
);
