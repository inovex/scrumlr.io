import {FC, ComponentProps} from "react";
import {IconVariant} from ".";
import type {ReactComponent} from "*.svg";

type SVGReactComponent = typeof ReactComponent;

export type IconComponentProps = {
  variant?: IconVariant | "auto";
} & ComponentProps<SVGReactComponent>;

export default function createIcon(variants: {[V in IconVariant]: SVGReactComponent}) {
  const IconComponent: FC<IconComponentProps> = ({variant, ...props}) => {
    // TODO load theme
    if (variant === "auto" || variant === undefined) {
      variant = "dark";
    }

    const Component = variants[variant];
    return <Component {...props} />;
  };

  return IconComponent;
}
