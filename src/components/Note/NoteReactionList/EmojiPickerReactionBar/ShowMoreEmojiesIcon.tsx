import React from "react";
import {ShowMoreDefaultLight, ShowMoreDefaultDark, ShowMoreHoverLight, ShowMoreHoverDark, ShowMoreActiveLight, ShowMoreActiveDark} from "components/Icon";
import "./ShowMoreEmojiesIcon.scss";

interface ShowMoreEmojiesIconProps {
  className?: string;
}

export const ShowMoreEmojiesIcon: React.FC<ShowMoreEmojiesIconProps> = ({className}) => (
  <div className={`show-more-emojies-icon ${className || ""}`}>
    {/* Default state icons */}
    <ShowMoreDefaultLight className="show-more-emojies-icon__icon show-more-emojies-icon__icon--default show-more-emojies-icon__icon--light" />
    <ShowMoreDefaultDark className="show-more-emojies-icon__icon show-more-emojies-icon__icon--default show-more-emojies-icon__icon--dark" />

    {/* Hover state icons */}
    <ShowMoreHoverLight className="show-more-emojies-icon__icon show-more-emojies-icon__icon--hover show-more-emojies-icon__icon--light" />
    <ShowMoreHoverDark className="show-more-emojies-icon__icon show-more-emojies-icon__icon--hover show-more-emojies-icon__icon--dark" />

    {/* Active state icons */}
    <ShowMoreActiveLight className="show-more-emojies-icon__icon show-more-emojies-icon__icon--active show-more-emojies-icon__icon--light" />
    <ShowMoreActiveDark className="show-more-emojies-icon__icon show-more-emojies-icon__icon--active show-more-emojies-icon__icon--dark" />
  </div>
);
