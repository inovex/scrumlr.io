import "./Request.scss";
import {ReactComponent as HandIcon} from "assets/icon-hand.svg";
import {useTranslation} from "react-i18next";
import {UserAvatar} from "../../BoardUsers";
import {Auth} from "../../../types/auth";

type RequestType = "JOIN" | "RAISE_HAND";

export type RequestProps = {
  type: RequestType;
  participant: Auth;
  handleClick: (user: string) => void;
};

export const Request = ({type, participant, handleClick}: RequestProps) => {
  const {t} = useTranslation();

  const renderButtons = (type: RequestType) => {
    if (type === "JOIN") {
      return (
        <>
          <button className="request__button" onClick={() => handleClick(participant.id)}>
            reject
          </button>
          <button className="request__button" onClick={() => handleClick(participant.id)}>
            accept
          </button>
        </>
      );
    } 
      return (
        <button className="request__button" onClick={() => handleClick(participant.id)}>
          {t("RaiseRequest.lower")}
        </button>
      );
    
  };

  return (
    <div className="request__container">
      <figure className="request__request-figure">
        <UserAvatar id={participant.id} avatar={participant.avatar} name={participant.name} />
      </figure>

      {/* either `request__text-container` or `request__button` is displayed */}
      <div className="request__middle-wrapper">
        <div className="request__info-container">
          <span className="request__participant-name">{participant.name}</span>
          <span className="request__info-text">{t("RaiseRequest.title")}</span>
        </div>
        <div className="request__button-container">{renderButtons(type)}</div>
      </div>

      <div className="request__icon-container">
        <HandIcon className="request-icon" />
      </div>
    </div>
  );
};
