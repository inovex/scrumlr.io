import store from "store";
import {ActionFactory} from "store/action";
import avatar from "assets/avatar.png";
import {JoinRequestClientModel} from "types/joinRequest";
import "./JoinRequest.scss";

export function JoinRequest({joinRequests}: {joinRequests: JoinRequestClientModel[]}) {
  function handleAccept(boardId: string, userIds: string[]) {
    store.dispatch(ActionFactory.acceptJoinRequests(boardId, userIds));
  }

  function handleReject(boardId: string, userIds: string[]) {
    store.dispatch(ActionFactory.rejectJoinRequests(boardId, userIds));
  }

  if (joinRequests.length === 1) {
    const joinRequest = joinRequests[0];
    return (
      <div className="join-request join-request--single">
        <div className="join-request__header">
          <span className="join-request__header-text">Jemand möchte dem Board beitreten</span>
        </div>
        <div className="join-request__main">
          <figure className="join-request__request-figure">
            <img className="join-request__request-image" src={avatar} alt="User" />
            <figcaption className="join-request__request-name">{joinRequest.displayName}</figcaption>
          </figure>
        </div>
        <div className="join-request__footer">
          <button
            onClick={() => handleReject(joinRequest.boardId, [joinRequest.userId])}
            className="join-request__button join-request__footer-button join-request--single__footer-button"
          >
            Ablehnen
          </button>
          <button
            onClick={() => handleAccept(joinRequest.boardId, [joinRequest.userId])}
            className="join-request__button join-request__footer-button join-request--single__footer-button"
          >
            Annehmen
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="join-request join-request--multiple">
      <div className="join-request__header">
        <span className="join-request__header-text">Mehrere Personen möchten dem Board beitreten</span>
      </div>
      <div className="join-request__main">
        <div className="join-request__requests-preview">
          <img src={avatar} alt="User" className="join-request__preview-image" />
          <img src={avatar} alt="User" className="join-request__preview-image" />
          {joinRequests.length > 2 && <div className="join-request__preview-rest">+{joinRequests.length - 2}</div>}
          <span className="join-request__preview-names">{joinRequests.map((joinRequest) => joinRequest.displayName).join(", ")}</span>
        </div>

        <ul className="join-request__requests">
          {joinRequests.map((joinRequest) => (
            <li key={joinRequest.id}>
              <figure className="join-request__requests-figure">
                <img src={avatar} className="join-request__requests-avatar" alt="Avatar" />
                <figcaption className="join-request__requests-displayname">{joinRequest.displayName}</figcaption>
                <button className="join-request__button join-request__requests-button" onClick={() => handleReject(joinRequest.boardId, [joinRequest.userId])}>
                  Ablehnen
                </button>
                <button className="join-request__button join-request__requests-button" onClick={() => handleAccept(joinRequest.boardId, [joinRequest.userId])}>
                  Annehmen
                </button>
              </figure>
            </li>
          ))}
        </ul>
      </div>
      <div className="join-request__footer join-request--multiple__footer">
        <button
          className="join-request__button join-request__footer-button join-request--multiple__footer-button"
          onClick={() =>
            handleReject(
              joinRequests[0].boardId,
              joinRequests.map((joinRequest) => joinRequest.userId)
            )
          }
        >
          Alle Ablehnen
        </button>
        <button
          className="join-request__button join-request__footer-button join-request--multiple__footer-button"
          onClick={() =>
            handleAccept(
              joinRequests[0].boardId,
              joinRequests.map((joinRequest) => joinRequest.userId)
            )
          }
        >
          Alle Annehmen
        </button>
      </div>
    </div>
  );
}
