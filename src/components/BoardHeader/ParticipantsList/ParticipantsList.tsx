import {Portal} from "components/Portal";
import {useState, VFC} from "react";
import "./ParticipantsList.scss";
import {useAppSelector} from "store";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";
import {useTranslation} from "react-i18next";
import {Participant} from "./Participant";

type ParticipantsListProps = {
  open: boolean;
  onClose: () => void;
};

export const ParticipantsList: VFC<ParticipantsListProps> = (props) => {
  const {t} = useTranslation();

  const {me, them} = useAppSelector((state) => ({
    me: state.participants!.self,
    them: state.participants!.others.filter((p) => p.connected),
  }));

  const [searchString, setSearchString] = useState("");

  if (!props.open || them.length < 0) {
    return null;
  }

  const showMe = searchString.split(" ").every((substr) => me.user.name.toLowerCase().includes(substr));

  return (
    <Portal
      onClose={() => {
        props.onClose();
        setSearchString("");
      }}
    >
      <aside className="participants" onClick={(e) => e.stopPropagation()}>
        <div className="participants__header">
          <div className="participants__header-title">
            <h4 className="participants__header-text">
              <span>{t("ParticipantsList.title")}</span>
              <span className="participants__header-number">{them.length + 1}</span>
            </h4>
          </div>
          <div className="participants__header-search">
            <SearchIcon className="participants__search_icon" />
            <input
              className="participants__header-input"
              placeholder={t("ParticipantsList.search")}
              onChange={(event) => setSearchString(event.target.value.trim().toLowerCase())}
            />
          </div>
        </div>
        <ul className="participants__list">
          <div className="list__header">
            <label>{t("ParticipantsList.headerLegendName")}</label>
            {(me.role === "MODERATOR" || me.role === "OWNER") && <label>{t("ParticipantsList.headerLegendAdmin")}</label>}
          </div>
          {showMe && <Participant key={me.user.id} participant={me!} />}
          {them.length > 0 &&
            them
              .sort((parA, parB) => parA.user.name.localeCompare(parB.user.name)) // Sort participants by name
              .filter((participant) => searchString.split(" ").every((substr) => participant.user.name.toLowerCase().includes(substr)))
              .map((participant) => <Participant key={participant.user.id} participant={participant} />)}
        </ul>
      </aside>
    </Portal>
  );
};
