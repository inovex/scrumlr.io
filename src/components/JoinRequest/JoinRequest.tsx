import store from "store";
import {ActionFactory} from "store/action";

import {JoinRequestClientModel} from "types/joinRequest";
import "./JoinRequest.scss";
import {UserAvatar} from "../BoardUsers";

export function JoinRequest({joinRequests}: {joinRequests: JoinRequestClientModel[]}) {
  const handleAccept = (boardId: string, userIds: string[]) => () => {
    store.dispatch(ActionFactory.acceptJoinRequests(boardId, userIds));
  };

  const handleReject = (boardId: string, userIds: string[]) => () => {
    store.dispatch(ActionFactory.rejectJoinRequests(boardId, userIds));
  };

  return (
    <div className="join-request">
      <div className="join-request__header">Someone requests to participate</div>

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
                  Reject
                </button>
                <button className="join-request__button" onClick={handleAccept(joinRequest.boardId, [joinRequest.userId])}>
                  Accept
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
            Reject all
          </button>
          <button
            className="join-request__button"
            onClick={handleAccept(
              joinRequests[0].boardId,
              joinRequests.map((joinRequest) => joinRequest.userId)
            )}
          >
            Accept all
          </button>
        </div>
      )}
    </div>
  );
}
