import store from "store";
import {ActionFactory} from "store/action";
import avatar from "assets/avatar.png";
import {JoinRequestClientModel} from "types/joinRequest";
import "./JoinRequest.scss";

function JoinRequest(joinRequest: JoinRequestClientModel) {
  function handleAccept() {
    store.dispatch(ActionFactory.acceptJoinRequest(joinRequest.id, joinRequest.boardId, joinRequest.userId));
  }

  function handleReject() {
    store.dispatch(ActionFactory.rejectJoinRequest(joinRequest.id, joinRequest.boardId, joinRequest.userId));
  }

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
        <button onClick={handleReject} className="join-request__footer-button join-request__footer-button--reject">
          Ablehnen
        </button>
        <button onClick={handleAccept} className="join-request__footer-button join-request__footer-button--accept">
          Annehmen
        </button>
      </footer>
    </div>
  );
}

export default JoinRequest;
