import store from "store";
import {ActionFactory} from "store/action";
import avatar from "assets/avatar.png";
import {JoinRequestClientModel} from "types/joinRequest";
import "./JoinRequest.scss";

function JoinRequest({joinRequests}: {joinRequests: JoinRequestClientModel[]}) {
  function handleAccept(id: string, boardId: string, userId: string) {
    store.dispatch(ActionFactory.acceptJoinRequest(id, boardId, userId));
  }

  function handleReject(id: string, boardId: string, userId: string) {
    store.dispatch(ActionFactory.rejectJoinRequest(id, boardId, userId));
  }

  function handleAcceptAll(boardId: string) {
    store.dispatch(ActionFactory.acceptAllPendingJoinRequests(boardId));
  }

  function handleRejectAll(boardId: string) {
    store.dispatch(ActionFactory.rejectAllPendingJoinRequests(boardId));
  }

  if (joinRequests.length === 1) {
    const joinRequest = joinRequests[0];
    return (
      <div className="join-request join-request--single">
        <header className="join-request__header">
          <span className="join-request__header-text">Jemand möchte dem Board beitreten</span>
        </header>
        <main className="join-request__main">
          <figure className="join-request__request-figure">
            <img className="join-request__request-image" src={avatar} alt="User" />
            <figcaption className="join-request__request-name">{joinRequest.displayName}</figcaption>
          </figure>
        </main>
        <footer className="join-request__footer">
          <button
            onClick={(_) => handleReject(joinRequest.id, joinRequest.boardId, joinRequest.userId)}
            className="join-request__button join-request__footer-button join-request--single__footer-button"
          >
            Ablehnen
          </button>
          <button
            onClick={(_) => handleAccept(joinRequest.id, joinRequest.boardId, joinRequest.userId)}
            className="join-request__button join-request__footer-button join-request--single__footer-button"
          >
            Annehmen
          </button>
        </footer>
      </div>
    );
  }
  return (
    <div className="join-request join-request--multiple">
      <header className="join-request__header">
        <span className="join-request__header-text">Mehrere Personen möchten dem Board beitreten</span>
      </header>
      <main className="join-request__main">
        <div className="join-request__requests-preview">
          <img src={avatar} alt="User" className="join-request__preview-image" />
          <img src={avatar} alt="User" className="join-request__preview-image" />
          {joinRequests.length > 2 && <div className="join-request__preview-rest">+{joinRequests.length - 2}</div>}
          <span className="join-request__preview-names">{joinRequests.map((joinRequest) => joinRequest.displayName).join(", ")}</span>
        </div>

        <ul className="join-request__requests">
          {joinRequests.map((joinRequest) => (
            <li>
              <figure className="join-request__requests-figure">
                <img src={avatar} className="join-request__requests-avatar" />
                <figcaption className="join-request__requests-displayname">{joinRequest.displayName}</figcaption>
                <button className="join-request__button join-request__requests-button" onClick={(_) => handleReject(joinRequest.id, joinRequest.boardId, joinRequest.userId)}>
                  Ablehnen
                </button>
                <button className="join-request__button join-request__requests-button" onClick={(_) => handleAccept(joinRequest.id, joinRequest.boardId, joinRequest.userId)}>
                  Annehmen
                </button>
              </figure>
            </li>
          ))}
        </ul>
      </main>
      <footer className="join-request__footer join-request--multiple__footer">
        <button className="join-request__button join-request__footer-button join-request--multiple__footer-button" onClick={(_) => handleRejectAll(joinRequests[0].boardId)}>
          Alle Ablehnen
        </button>
        <button className="join-request__button join-request__footer-button join-request--multiple__footer-button" onClick={(_) => handleAcceptAll(joinRequests[0].boardId)}>
          Alle Annehmen
        </button>
      </footer>
    </div>
  );
}

export default JoinRequest;

// TODO: CSS aufraeumen & Animations
// TODO: Testing
