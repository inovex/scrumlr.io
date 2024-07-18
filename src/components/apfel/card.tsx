import {ComponentInternals, Container, ContainerProperties, DefaultProperties} from "@react-three/uikit";
import {ReactNode, RefAttributes, forwardRef} from "react";
import {GlassMaterial, colors} from "./theme";

export type CardProperties = ContainerProperties;

export const Card: (props: CardProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(({children, ...props}, ref) => (
  <Container
    panelMaterialClass={GlassMaterial}
    backgroundColor={colors.card}
    borderColor={colors.card}
    borderOpacity={0.95}
    borderWidth={4}
    borderBend={0.3}
    borderRadius={32}
    ref={ref}
    castShadow
    {...props}
  >
    <DefaultProperties color={colors.cardForeground}>{children}</DefaultProperties>
  </Container>
));
