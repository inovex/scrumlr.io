import {Actions} from "store/action";
import {Request as RequestModel} from "types/request";
import "./Request.scss";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Participant} from "types/participant";
import {UserAvatar} from "../BoardUsers";

export interface RequestProps {
  requests: RequestModel[];
  participantsWithRaisedHand: Participant[];
}

export const Request = ({requests, participantsWithRaisedHand}: RequestProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const handleAccept = (userIds: string[]) => () => {
    dispatch(Actions.acceptJoinRequests(userIds));
  };

  const handleReject = (userIds: string[]) => () => {
    dispatch(Actions.rejectJoinRequests(userIds));
  };

  const lowerHand = (userId: string[]) => {
    userId.forEach((user) => {
      dispatch(Actions.setRaisedHand(user, false));
    });
  };

  let title = "";
  if (requests.length !== 0 && participantsWithRaisedHand.length !== 0) title = t("Request.title");
  else if (requests.length === 0) title = t("RaiseRequest.title");
  else if (participantsWithRaisedHand.length === 0) title = t("JoinRequest.title");

  return (
    <div>
      {(requests.length !== 0 || participantsWithRaisedHand.length !== 0) && (
        <div className="join-request">
          <div className="request__header">{title}</div>
          <div className="request__main">
            <ul className="request__requests">
              {requests.map((joinRequest) => (
                <li key={joinRequest.user.id} className="join-request__unique-request-container">
                  <figure className="join-request__request-figure">
                    <UserAvatar id={joinRequest.user.id} avatar={joinRequest.user.avatar} title={joinRequest.user.name} />
                    <figcaption className="join-request__request-display-name">{joinRequest.user.name}</figcaption>
                  </figure>

                  <div>
                    <button className="request__button" onClick={handleReject([joinRequest.user.id])}>
                      {t("JoinRequest.reject")}
                    </button>
                    <button className="request__button" onClick={handleAccept([joinRequest.user.id])}>
                      {t("JoinRequest.accept")}
                    </button>
                  </div>
                </li>
              ))}

              {participantsWithRaisedHand.map((p) => (
                <li key={p.user.id} className="join-request__unique-request-container">
                  <figure className="join-request__request-figure">
                    <UserAvatar id={p.user.id} avatar={p.user.avatar} title={p.user.name} />
                    <figcaption className="join-request__request-display-name">{p.user.name}</figcaption>
                  </figure>

                  <div>
                    <button className="request__button" onClick={() => lowerHand([p.user.id])}>
                      {t("RaiseRequest.lower")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {(requests.length > 1 || participantsWithRaisedHand.length > 1) && (
            <div className="request__footer">
              {participantsWithRaisedHand.length > 1 && (
                <button className="request__button" onClick={() => lowerHand(participantsWithRaisedHand.map((p) => p.user.id))}>
                  {t("RaiseRequest.lowerAll")}
                </button>
              )}
              {requests.length > 1 && (
                <>
                  <button className="request__button" onClick={handleReject(requests.map((joinRequest) => joinRequest.user.id))}>
                    {t("JoinRequest.rejectAll")}
                  </button>
                  <button className="request__button" onClick={handleAccept(requests.map((joinRequest) => joinRequest.user.id))}>
                    {t("JoinRequest.acceptAll")}
                  </button>{" "}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
