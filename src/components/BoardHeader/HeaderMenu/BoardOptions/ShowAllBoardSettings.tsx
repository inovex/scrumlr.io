import React from "react";
import {BoardOption} from "./BoardOption";
import {BoardOptionLink} from "./BoardOptionLink";

type ShowAllBoardSettingsProps = {
  onClose?: () => void;
};

export const ShowAllBoardSettings: React.VFC<ShowAllBoardSettingsProps> = (props) => (
  <BoardOption data-testid="allSettings">
    <BoardOptionLink to="settings" label="Show all board settings" onClick={props.onClose} />
  </BoardOption>
);
