import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import classNames from "classnames";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {useDebounce} from "utils/hooks/useDebounce";
import {UserAvatar} from "components/BoardUsers";
import {ReactComponent as WifiIconDisabled} from "assets/icon-wifi-disabled.svg";
import {ReactComponent as MagnifyingGlassIcon} from "assets/icon-magnifying-glass.svg";
import {ReactComponent as ReadyCheckIcon} from "assets/icon-check.svg";
import "./Participants.scss";

export const Participants = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [queryString, setQueryString] = useState<string>("");
  const debouncedQueryString = useDebounce(queryString);
  const [permissionFilter, setPermissionFilter] = useState<"ALL" | "OWNER" | "MODERATOR" | "PARTICIPANT">("ALL");
  const [onlineFilter, setOnlineFilter] = useState<boolean>(true);

  const isModerator = useAppSelector((state) => state.participants!.self.role === "OWNER" || state.participants!.self.role === "MODERATOR");
  const self = useAppSelector((state) => state.participants!.self);
  const participants = useAppSelector((state) => [state.participants!.self, ...(state.participants?.others ?? [])]);
  const existsAtLeastOneReadyUser = participants.some((p) => p.ready);

  const resetReadyStateOfAllUsers = () => {
    participants.forEach((p) => dispatch(Actions.setUserReadyStatus(p.user.id, false)));
  };

  return (
    <section className="settings-dialog__container accent-color__poker-purple">
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("Participants.Title")}</h2>
      </header>
      <div className="participants__search-input-wrapper">
        <input placeholder="Name..." className="participants__search-input" onChange={(e) => setQueryString(e.target.value)} />
        <MagnifyingGlassIcon className="participants__search-icon" />
      </div>
      <div className="participants__filter-buttons">
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "OWNER"})}
          onClick={() => setPermissionFilter(permissionFilter === "OWNER" ? "ALL" : "OWNER")}
          title={t("Participants.OwnerFilterTooltip")}
        >
          {t("UserRole.Owner")}
        </button>
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "MODERATOR"})}
          onClick={() => setPermissionFilter(permissionFilter === "MODERATOR" ? "ALL" : "MODERATOR")}
          title={t("Participants.ModeratorFilterTooltip")}
        >
          {t("UserRole.Moderator")}
        </button>
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "PARTICIPANT"})}
          onClick={() => setPermissionFilter(permissionFilter === "PARTICIPANT" ? "ALL" : "PARTICIPANT")}
          title={t("Participants.ParticipantFilterTooltip")}
        >
          {t("UserRole.Participant")}
        </button>

        <button
          aria-label={t("Participants.OnlineFilterTooltip")}
          className={classNames("participant__status-filter-button", {"participant__status-filter-button--active": !onlineFilter})}
          onClick={() => setOnlineFilter((o) => !o)}
          title={t("Participants.OnlineFilterTooltip")}
        >
          <WifiIconDisabled />
        </button>
      </div>

      <ul className="participants__list">
        {participants
          .filter((participant) =>
            debouncedQueryString
              .toLowerCase()
              .split(" ")
              .every((s) => participant.user.name.toLowerCase().includes(s))
          )
          .filter((participant) => participant.role === permissionFilter || permissionFilter === "ALL")
          .filter((participant) => participant.connected === onlineFilter)
          .map((participant) => (
            <li key={participant.user.id} className="participants__list-item">
              <UserAvatar avatar={participant.user.avatar} className="participant__avatar" id={participant.user.id} title={participant.user.name} />
              <div className="participant__name-role-wrapper">
                <span className="participant__name">{participant.user.name}</span>
                {participant.role === "OWNER" || !isModerator || participant.user.id === self.user.id ? (
                  <span className="participant__role">
                    {participant.role === "OWNER" && t("UserRole.Owner")}
                    {participant.role === "MODERATOR" && t("UserRole.Moderator")}
                    {participant.role === "PARTICIPANT" && t("UserRole.Participant")}
                  </span>
                ) : (
                  <div className="participant__role-buttons">
                    <button
                      className={classNames("participant__role", {"participant__role--active": participant.role === "MODERATOR"})}
                      disabled={participant.role === "MODERATOR"}
                      onClick={() => dispatch(Actions.changePermission(participant.user.id, true))}
                      title={t("Participants.ChangeRoleToModeratorTooltip")}
                    >
                      {t("UserRole.Moderator")}
                    </button>
                    <button
                      className={classNames("participant__role", {"participant__role--active": participant.role === "PARTICIPANT"})}
                      disabled={participant.role === "PARTICIPANT"}
                      onClick={() => dispatch(Actions.changePermission(participant.user.id, false))}
                      title={t("Participants.ChangeRoleToParticipantTooltip")}
                    >
                      {t("UserRole.Participant")}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
      </ul>
      <footer className={classNames("participants-reset-state-banner__container", {"participants-reset-state-banner__container--is-active": existsAtLeastOneReadyUser})}>
        <div className="participants-reset-state-banner__icon-and-text">
          <ReadyCheckIcon className="participants-reset-state-banner__check-icon" />
          <div className="participants-reset-state-banner__text">{t("Participants.ResetBannerText")}</div>
        </div>
        <button className="participants-reset-state-banner__button" onClick={() => resetReadyStateOfAllUsers()}>
          {t("Participants.ResetBannerButton")}
        </button>
      </footer>
    </section>
  );
};
