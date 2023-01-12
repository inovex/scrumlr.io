import {useState} from "react";
import {useDispatch} from "react-redux";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import classNames from "classnames";
import "./Participants.scss";
import {ReactComponent as WifiIconDisabled} from "assets/icon-wifi-disabled.svg";
import {UserAvatar} from "components/BoardUsers";
import {ReactComponent as MagnifyingGlassIcon} from "assets/icon-magnifying-glass.svg";
import {useDebounce} from "utils/hooks/useDebounce";
import {useTranslation} from "react-i18next";

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
        >
          {t("UserRole.Owner")}
        </button>
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "MODERATOR"})}
          onClick={() => setPermissionFilter(permissionFilter === "MODERATOR" ? "ALL" : "MODERATOR")}
        >
          {t("UserRole.Moderator")}
        </button>
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "PARTICIPANT"})}
          onClick={() => setPermissionFilter(permissionFilter === "PARTICIPANT" ? "ALL" : "PARTICIPANT")}
        >
          {t("UserRole.Participant")}
        </button>

        <button
          aria-label=""
          className={classNames("participant__status-filter-button", {"participant__status-filter-button--active": !onlineFilter})}
          onClick={() => setOnlineFilter((o) => !o)}
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
                    {participant.role === "OWNER" ? t("UserRole.Owner") : participant.role === "MODERATOR" ? t("UserRole.Moderator") : t("UserRole.Participant")}
                  </span>
                ) : (
                  <div className="participant__role-buttons">
                    <button
                      className={classNames("participant__role-button", {"participant__role-button--active": participant.role === "MODERATOR"})}
                      onClick={() => dispatch(Actions.changePermission(participant.user.id, true))}
                    >
                      {t("UserRole.Moderator")}
                    </button>
                    <button
                      className={classNames("participant__role-button", {"participant__role-button--active": participant.role === "PARTICIPANT"})}
                      onClick={() => dispatch(Actions.changePermission(participant.user.id, false))}
                    >
                      {t("UserRole.Participant")}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
};
