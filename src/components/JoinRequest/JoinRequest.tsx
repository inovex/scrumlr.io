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

  if (joinRequests.length === 1) {
    const joinRequest = joinRequests[0];
    return (
      <div className="join-request">
        <header className="join-request__header">
          <span className="join-request__header-text">Jemand möchte dem Board beitreten</span>
        </header>
        <main className="join-request__content">
          <figure className="join-request__content-user">
            <img className="join-request__content-user-image" src={avatar} alt="User" />
            <figcaption className="join-request__content-user-name">{joinRequest.displayName}</figcaption>
          </figure>
        </main>
        <footer className="join-request__footer">
          <button
            onClick={(_) => handleReject(joinRequest.id, joinRequest.boardId, joinRequest.userId)}
            className="join-request__footer-button join-request__footer-button--reject"
          >
            Ablehnen
          </button>
          <button
            onClick={(_) => handleAccept(joinRequest.id, joinRequest.boardId, joinRequest.userId)}
            className="join-request__footer-button join-request__footer-button--accept"
          >
            Annehmen
          </button>
        </footer>
      </div>
    );
  } 
    // TODO: JoinRequest Modal for multiple users
    return null;
  
}

export default JoinRequest;
