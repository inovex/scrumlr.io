import React from "react";
import {BoardOption} from "./BoardOption";
import {BoardOptionLink} from "./BoardOptionLink";

export const ShowAllBoardSettings: React.VFC = () => (
    <BoardOption data-testid="allSettings">
      <BoardOptionLink to="settings" label="Show all board settings" />
    </BoardOption>
  );
