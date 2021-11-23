import "./BoardSettings.scss";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {AccessPolicyType} from "types/board";
import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import {useTranslation} from "react-i18next";

export type BoardSettingsProps = {
  activeEditMode: boolean;
  accessPolicy: AccessPolicyType;
  currentUserIsModerator: boolean;
  setActiveEditMode: Dispatch<SetStateAction<boolean>>;
  setAccessPolicy: Dispatch<SetStateAction<AccessPolicyType>>;
};

export var BoardSettings = function (props: BoardSettingsProps) {
  const {t} = useTranslation();
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  const [boardName, setBoardName] = useState(state.board.name);

  useEffect(() => {
    setBoardName(state.board.name);
  }, [state.board.name]);

  const onSubmit = () => {
    if (props.activeEditMode && state.board!.name !== boardName) {
      store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: boardName}));
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
          disabled={!props.activeEditMode}
          onChange={(e) => setBoardName(e.target.value)}
          ref={(input) => {
            if (!input?.disabled) input?.focus();
          }}
          onFocus={(e) => e.target.select()}
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
