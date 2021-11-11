import "./BoardSettings.scss";
import {Dispatch, SetStateAction} from "react";
import {AccessPolicyType} from "types/board";
import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import {useTranslation} from "react-i18next";

export type BoardSettingsProps = {
  activeEditMode: boolean;
  accessPolicy: AccessPolicyType;
  boardName: string;
  currentUserIsModerator: boolean;
  setActiveEditMode: Dispatch<SetStateAction<boolean>>;
  setBoardName: Dispatch<SetStateAction<string>>;
  setAccessPolicy: Dispatch<SetStateAction<AccessPolicyType>>;
};

export const BoardSettings = (props: BoardSettingsProps) => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  const onSubmit = () => {
    if (props.activeEditMode && state.board!.name !== props.boardName) {
      store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: props.boardName}));
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
          value={props.boardName}
          disabled={!props.activeEditMode}
          onChange={(e) => props.setBoardName(e.target.value)}
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
