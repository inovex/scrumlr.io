import "./BoardSettings.scss";
import classNames from "classnames";
import {Dispatch, SetStateAction} from "react";
import {AccessPolicyType} from "types/board";

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
  /* const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  })); */

  const onSubmit = () => {
    // FIXME edit board here
    /* if (props.activeEditMode && (state.board!.\joinConfirmationRequired !== props.joinConfirmationRequired || state.board!.name !== props.boardName)) {
      store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: props.boardName, joinConfirmationRequired: props.joinConfirmationRequired}));
    }
    props.setActiveEditMode(!props.activeEditMode); */
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

        <button
          type="button"
          className="board-settings__access-mode"
          disabled={!props.activeEditMode}
          onClick={() => {} /* () => props.setJoinConfirmationRequired(!props.joinConfirmationRequired) */}
        >
          <div className={classNames("board-settings__access-mode-lock", {"board-settings__access-mode-lock--unlocked": props.accessPolicy === "Public"})} />
          {props.accessPolicy !== "Public" ? "Private Session" : "Public Session"}
        </button>
        {props.currentUserIsModerator && (
          <button type="submit" className="board-settings__edit-button">
            {props.activeEditMode ? "save" : "edit"}
          </button>
        )}
      </form>
    </li>
  );
};
