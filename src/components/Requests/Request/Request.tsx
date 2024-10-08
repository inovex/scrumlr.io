import "./Request.scss";
import {RaiseHand, Join} from "components/Icon";
import {useTranslation} from "react-i18next";
import {Auth} from "store/features";
import {UserAvatar} from "../../BoardUsers";

type RequestType = "JOIN" | "RAISE_HAND";

type RequestProps = {
  type: RequestType;
  participant: Auth;
  handleClick: (user: string, acceptJoin?: boolean) => void;
};

export const Request = ({type, participant, handleClick}: RequestProps) => {
  const {t} = useTranslation();

  const renderButtons = () => {
    if (type === "JOIN") {
      return (
        <>
          <button className="request__button" onClick={() => handleClick(participant.id, false)}>
            {t("JoinRequest.reject")}
          </button>
          <button className="request__button" onClick={() => handleClick(participant.id, true)}>
            {t("JoinRequest.accept")}
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
        <UserAvatar id={participant.id} avatar={participant.avatar} title={participant.name} />
      </figure>

      <div className="request__wrapper">
        <div className="request__info-container">
          <span className="request__participant-name">{participant.name}</span>
          <span className="request__info-text">{type === "JOIN" ? t("JoinRequest.title") : t("RaiseRequest.title")}</span>
        </div>
        <div className="request__button-container">{renderButtons()}</div>
      </div>

      <div className="request__icon-container">{type === "JOIN" ? <Join className="request-icon" /> : <RaiseHand className="request-icon" />}</div>
    </div>
  );
};
