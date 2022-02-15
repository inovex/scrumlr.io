import classNames from "classnames";
import Parse from "parse";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {ApplicationState} from "types/store";
import {Avatar} from "components/Avatar";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsToggle} from "../Components/SettingsToggle";
import "./Participants.scss";
import "../SettingsDialog.scss";

export const Participants = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    participants: applicationState.users.all, // Online-Offline
    board: applicationState.board.data!,
    boardOwner: applicationState.board.data!.owner,
    currentUserIsModerator: applicationState.users.admins.find((user) => user.id === Parse.User.current()!.id) !== undefined,
  }));

  const currentUser = Parse.User.current();

  const me = state.participants.find((participant) => participant.id === currentUser!.id); // Online-Offline
  const them = state.participants.filter((participant) => participant.id !== currentUser!.id); // Online-Offline

  return (
    <div className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__poker-purple")}> Participants</h2>
      </div>

      <div className={classNames("participants__container", "accent-color__poker-purple")}>
        <div className="participants__search-and-filter">Suche und Filter?</div>
        <div className="participants__user-list">
          <SettingsButton className="participants__list-item" label={me!.displayName}>
            <Avatar seed={me!.id} />
            <div className={me!.online ? "participant__online-mark" : "participant__offline-mark"} />
            <SettingsToggle active={me!.admin} />
          </SettingsButton>
          {them.length > 0 && <hr className="settings-dialog__seperator" />}
          {them.length > 0 &&
            them.map((participant, index) => (
              <>
                <SettingsButton
                  className="participants__list-item"
                  label={participant.displayName}
                  onClick={() => store.dispatch(ActionFactory.changePermission(participant!.id, !participant.admin))}
                >
                  <Avatar seed={participant.id} />
                  <div className={participant.online ? "participant__online-mark" : "participant__offline-mark"} />
                  <SettingsToggle active={participant.admin} />
                </SettingsButton>
                {them[index + 1] && <hr className="settings-dialog__seperator" />}
              </>
            ))}
        </div>
      </div>
    </div>
  );
};
