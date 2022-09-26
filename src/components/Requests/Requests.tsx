import {Actions} from "store/action";
import {Request as RequestModel} from "types/request";
import "./Request.scss";
// import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Participant} from "types/participant";
// import {UserAvatar} from "../BoardUsers";

export interface RequestProps {
  requests: RequestModel[];
  participantsWithRaisedHand: Participant[];
}

export const Requests = ({requests, participantsWithRaisedHand}: RequestProps) => {
  // const {t} = useTranslation();
  const dispatch = useDispatch();

  // @ts-ignore
  const handleAccept = (userIds: string[]) => () => {
    dispatch(Actions.acceptJoinRequests(userIds));
  };

  // @ts-ignore
  const handleReject = (userIds: string[]) => () => {
    dispatch(Actions.rejectJoinRequests(userIds));
  };

  // @ts-ignore
  const lowerHand = (userId: string[]) => {
    userId.forEach((user) => {
      dispatch(Actions.setRaisedHand(user, false));
    });
  };

  return requests.length !== 0 || participantsWithRaisedHand.length !== 0 ? (
    <div className="requests__wrapper">
      <div className="request__main">
        {/* list of all request */}
        <ul className="request__requests">
          {/* all raise hand requests */}
          {participantsWithRaisedHand.map((p) => (
            <li key={p.user.id} className="join-request__unique-request-container">
              <div>(Avatar)</div>
              <div>{p.user.name}</div>
              <div>(Click)</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : null;
};
