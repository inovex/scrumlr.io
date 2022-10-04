import "./Request.scss";
import {ReactComponent as HandIcon} from "assets/icon-hand.svg";
import {useTranslation} from "react-i18next";
import {Participant} from "../../../types/participant";
import {UserAvatar} from "../../BoardUsers";

export type RequestProps = {
  participant: Participant;
};

export const Request = ({participant}: RequestProps) => {
  const {t} = useTranslation();

  return (
    <div className="request__container">
      <figure className="request__request-figure">
        <UserAvatar id={participant.user.id} avatar={participant.user.avatar} name={participant.user.name} />
      </figure>

      {/* either `request__text-container` or `request__button` is displayed */}
      <div className="request__middle-wrapper">
        <div className="request__info-container">
          <span className="request__participant-name">{participant.user.name}</span>
          <span className="request__info-text">{t("RaiseRequest.title")}</span>
        </div>
        <button className="request__button">{t("RaiseRequest.lower")}</button>
      </div>

      <div className="request__icon-container">
        <HandIcon className="request-icon" />
      </div>
    </div>
  );
};
