import store from "store";
import {ActionFactory} from "store/action";
import {JoinRequestClientModel} from "types/joinRequest";
import "./Request.scss";
import {useTranslation} from "react-i18next";
import {UserClientModel} from "types/user";
import {UserAvatar} from "../BoardUsers";

export var Request = function ({
  joinRequests,
  users,
  raisedHands,
  boardId,
}: {
  joinRequests: JoinRequestClientModel[];
  users: UserClientModel[];
  raisedHands: string[];
  boardId: string;
}) {
  const {t} = useTranslation();

  const handleAccept = (boardId: string, userIds: string[]) => () => {
    store.dispatch(ActionFactory.acceptJoinRequests(boardId, userIds));
  };

  const handleReject = (boardId: string, userIds: string[]) => () => {
    store.dispatch(ActionFactory.rejectJoinRequests(boardId, userIds));
  };

  const lowerHand = (userId: string[]) => {
    store.dispatch(ActionFactory.setRaisedHandStatus({userId, raisedHand: false}));
  };

  let title = "";
  if (joinRequests.length != 0 && raisedHands.length != 0) title = t("Request.title");
  else if (joinRequests.length == 0) title = t("RaiseRequest.title");
  else if (raisedHands.length == 0) title = t("JoinRequest.title");

  return (
    <div>
      {(joinRequests.length != 0 || raisedHands.length != 0) && (
        <div className="join-request">
          <div className="request__header">{title}</div>
          <div className="request__main">
            <ul className="request__requests">
              {joinRequests.map((joinRequest) => (
                <li key={joinRequest.id} className="join-request__unique-request-container">
                  <figure className="join-request__request-figure">
                    <UserAvatar id={joinRequest.userId} name={joinRequest.displayName} />
                    <figcaption className="join-request__request-display-name">{joinRequest.displayName}</figcaption>
                  </figure>

                  <div>
                    <button className="request__button" onClick={handleReject(boardId, [joinRequest.userId])}>
                      {t("JoinRequest.reject")}
                    </button>
                    <button className="request__button" onClick={handleAccept(boardId, [joinRequest.userId])}>
                      {t("JoinRequest.accept")}
                    </button>
                  </div>
                </li>
              ))}

              {raisedHands.map((userId) => (
                <li key={userId} className="join-request__unique-request-container">
                  <figure className="join-request__request-figure">
                    <UserAvatar id={userId} name={users.find((user) => user.id === userId)!.displayName} />
                    <figcaption className="join-request__request-display-name">{users.find((user) => user.id === userId)!.displayName}</figcaption>
                  </figure>

                  <div>
                    <button className="request__button" onClick={() => lowerHand([userId])}>
                      {t("RaiseRequest.lower")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {(joinRequests.length > 1 || raisedHands.length > 1) && (
            <div className="request__footer">
              {raisedHands.length > 1 && (
                <button className="request__button" onClick={() => lowerHand(raisedHands)}>
                  {t("RaiseRequest.lowerAll")}
                </button>
              )}
              {joinRequests.length > 1 && (
                <>
                  <button
                    className="request__button"
                    onClick={handleReject(
                      joinRequests[0].boardId,
                      joinRequests.map((joinRequest) => joinRequest.userId)
                    )}
                  >
                    {t("JoinRequest.rejectAll")}
                  </button>
                  <button
                    className="request__button"
                    onClick={handleAccept(
                      joinRequests[0].boardId,
                      joinRequests.map((joinRequest) => joinRequest.userId)
                    )}
                  >
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
