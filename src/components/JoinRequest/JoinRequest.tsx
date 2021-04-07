import "./JoinRequest.scss";

type JoinRequestProps = {
    id: string;
    userId: string;
    boardId: string;
}

function JoinRequest(props: JoinRequestProps) {
    return (<section className="join-request">
        <span className="join-request__text">{props.userId}</span>
        <div className="join-request__buttons">
            <button className='join-request__button'>Annehmen</button>
            <button className='join-request__button'>Ablehen</button>
        </div>
    </section>);
}

export default JoinRequest;