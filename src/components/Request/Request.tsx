import store from "store";
import {ActionFactory} from "store/action";

import {JoinRequestClientModel} from "types/joinRequest";
import "./Request.scss";
import {useTranslation} from "react-i18next";
import {UserAvatar} from "../BoardUsers";

export var Request = function ({joinRequests}: {joinRequests: JoinRequestClientModel[]}) {
  if (joinRequests.length == 0) {
    return null;
  }

  const {t} = useTranslation();

  const handleAccept = (boardId: string, userIds: string[]) => () => {
    store.dispatch(ActionFactory.acceptJoinRequests(boardId, userIds));
  };

  const handleReject = (boardId: string, userIds: string[]) => () => {
    store.dispatch(ActionFactory.rejectJoinRequests(boardId, userIds));
  };

  return (
    <div className="join-request">
      <div className="join-request__header">{t("JoinRequest.title")}</div>

      <div className="join-request__main">
        <ul className="join-request__requests">
          {joinRequests.map((joinRequest) => (
            <li key={joinRequest.id} className="join-request__unique-request-container">
              <figure className="join-request__request-figure">
                <UserAvatar id={joinRequest.userId} name={joinRequest.displayName} />
                <figcaption className="join-request__request-display-name">{joinRequest.displayName}</figcaption>
              </figure>

              <div>
                <button className="join-request__button" onClick={handleReject(joinRequest.boardId, [joinRequest.userId])}>
                  {t("JoinRequest.reject")}
                </button>
                <button className="join-request__button" onClick={handleAccept(joinRequest.boardId, [joinRequest.userId])}>
                  {t("JoinRequest.accept")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {joinRequests.length > 1 && (
        <div className="join-request__footer">
          <button
            className="join-request__button"
            onClick={handleReject(
              joinRequests[0].boardId,
              joinRequests.map((joinRequest) => joinRequest.userId)
            )}
          >
            {t("JoinRequest.rejectAll")}
          </button>
          <button
            className="join-request__button"
            onClick={handleAccept(
              joinRequests[0].boardId,
              joinRequests.map((joinRequest) => joinRequest.userId)
            )}
          >
            {t("JoinRequest.acceptAll")}
          </button>
        </div>
      )}
    </div>
  );
};
