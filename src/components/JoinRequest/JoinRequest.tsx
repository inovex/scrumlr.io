// import store from "store";
// import { ActionFactory } from "store/action";
import avatar from "assets/avatar.png";
import "./JoinRequest.scss";

type JoinRequestProps = {
  id: string;
  boardId: string;
  userId: string;
  displayName: string;
};

function JoinRequest(props: JoinRequestProps) {
  // function handleAccept() {
  //     store.dispatch(ActionFactory.acceptJoinRequest(props.id, props.boardId, props.userId));
  // }

  // function handleDecline() {
  //     store.dispatch(ActionFactory.rejectJoinRequest(props.id, props.boardId, props.userId));
  // }

  return (
    <div className="join-request">
      <header className="join-request__header">
        <span className="join-request__header-text">Jemand möchte dem Board beitreten</span>
      </header>
      <main className="join-request__content">
        <figure className="join-request__content-user">
          <img className="join-request__content-user-image" src={avatar} alt="User" />
          <figcaption className="join-request__content-user-name">{props.displayName}</figcaption>
        </figure>
        <button className="join-request__footer-button join-request__footer-button--reject">Ablehnen</button>
        <button className="join-request__footer-button join-request__footer-button--accept">Annehmen</button>
      </main>
    </div>
  );
}

export default JoinRequest;
