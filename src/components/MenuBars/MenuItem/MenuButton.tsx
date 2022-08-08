import "./MenuItem.scss";
import React from "react";
import {TooltipButton} from "components/TooltipButton/TooltipButton";

type MenuButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  tabIndex?: number;
  className?: string;
};

export const MenuButton = (props: MenuButtonProps) => <TooltipButton {...props} />;
