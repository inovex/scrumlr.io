import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "./HeaderMenuItems.scss";
import classNames from "classnames";
import {Dispatch, SetStateAction} from "react";

export type BoardSettingsProps = {
  activeEditMode: boolean;
  joinConfirmationRequired: boolean;
  boardName: string;
  currentUserIsModerator: boolean;
  setActiveEditMode: Dispatch<SetStateAction<boolean>>;
  setBoardName: Dispatch<SetStateAction<string>>;
  setJoinConfirmationRequired: Dispatch<SetStateAction<boolean>>;
};

export const BoardSettings = (props: BoardSettingsProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  const onSubmit = () => {
    if (props.activeEditMode && (state.board!.joinConfirmationRequired !== props.joinConfirmationRequired || state.board!.name !== props.boardName)) {
      store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: props.boardName, joinConfirmationRequired: props.joinConfirmationRequired}));
    }
    props.setActiveEditMode(!props.activeEditMode);
  };

  return (
    <li className="header-menu__info">
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
          className="info__board-name"
          value={props.boardName}
          disabled={!props.activeEditMode}
          onChange={(e) => props.setBoardName(e.target.value)}
          ref={(input) => {
            if (!input?.disabled) input?.focus();
          }}
          onFocus={(e) => e.target.select()}
        />
        <button type="button" className="info__access-mode" disabled={!props.activeEditMode} onClick={() => props.setJoinConfirmationRequired(!props.joinConfirmationRequired)}>
          <div className={classNames("info__access-mode-lock", {"info__access-mode-lock--unlocked": !props.joinConfirmationRequired})} />
          {props.joinConfirmationRequired ? "Private Session" : "Public Session"}
        </button>
        {props.currentUserIsModerator && (
          <button type="submit" className="info__edit-button">
            {props.activeEditMode ? "save" : "edit"}
          </button>
        )}
      </form>
    </li>
  );
};
