import "./BoardSettings.scss";
import {Dispatch, SetStateAction, useState} from "react";
import {ApplicationState, useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {DEFAULT_BOARD_NAME} from "constants/misc";
import {editBoard} from "store/features";

export type BoardSettingsProps = {
  activeEditMode: boolean;
  currentUserIsModerator: boolean;
  setActiveEditMode: Dispatch<SetStateAction<boolean>>;
};

export const BoardSettings = (props: BoardSettingsProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const name = useAppSelector((state: ApplicationState) => state.board.data!.name) ?? "";

  const [boardName, setBoardName] = useState(name);

  const onSubmit = () => {
    if (props.activeEditMode && name !== boardName) {
      dispatch(editBoard({name: boardName}));
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
