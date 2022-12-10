import "./BoardSettings.scss";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import store, {useAppSelector} from "store";
import {ApplicationState} from "types";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {DEFAULT_BOARD_NAME} from "../../../../constants/misc";

export type BoardSettingsProps = {
  activeEditMode: boolean;
  currentUserIsModerator: boolean;
  setActiveEditMode: Dispatch<SetStateAction<boolean>>;
};

export const BoardSettings = (props: BoardSettingsProps) => {
  const {t} = useTranslation();
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  const [boardName, setBoardName] = useState(state.board.name ?? "");

  useEffect(() => {
    setBoardName(state.board.name ?? "");
  }, [state.board.name]);

  const onSubmit = () => {
    if (props.activeEditMode && state.board!.name !== boardName) {
      store.dispatch(Actions.editBoard({name: boardName}));
    }
    props.setActiveEditMode(!props.activeEditMode);
  };

  return (
    <li className="board-settings">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
      >
        <input
          className="board-settings__board-name"
          value={boardName}
          placeholder={DEFAULT_BOARD_NAME}
          disabled={!props.activeEditMode}
          onChange={(e) => setBoardName(e.target.value)}
          ref={(input) => {
            if (!input?.disabled) input?.focus();
          }}
          onFocus={(e) => {
            e.target.placeholder = "";
            if (boardName !== "") {
              e.target.select();
            }
          }}
          onBlur={(e) => {
            e.target.placeholder = DEFAULT_BOARD_NAME;
          }}
        />

        {props.currentUserIsModerator && (
          <button type="submit" className="board-settings__edit-button">
            {props.activeEditMode ? t("BoardSettings.save") : t("BoardSettings.edit")}
          </button>
        )}
      </form>
    </li>
  );
};
