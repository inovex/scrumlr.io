import {Actions} from "store/action";
import {Request as RequestModel} from "types/request";
import "./Requests.scss";
import {useDispatch} from "react-redux";
import {Participant} from "types/participant";
import {Request} from "./Request";

export interface RequestsProps {
  requests: RequestModel[];
  participantsWithRaisedHand: Participant[];
}

export const Requests = ({requests, participantsWithRaisedHand}: RequestsProps) => {
  const dispatch = useDispatch();

  const handleJoin = (user: string, acceptJoin?: boolean) => {
    if (acceptJoin) {
      dispatch(Actions.acceptJoinRequests([user]));
    } else {
      dispatch(Actions.rejectJoinRequests([user]));
    }
  };

  const lowerHand = (user: string) => {
    dispatch(Actions.setRaisedHand(user, false));
  };

  return requests.length || participantsWithRaisedHand.length ? (
    <div className="requests__wrapper">
      {/* join requests */}
      {requests.map((p) => (
        <Request key={p.user.id} type="JOIN" participant={p.user} handleClick={handleJoin} />
      ))}

      {/* raise hand requests */}
      {participantsWithRaisedHand.map((p) => (
        <Request key={p.user.id} type="RAISE_HAND" participant={p.user} handleClick={lowerHand} />
      ))}
    </div>
  ) : null;
};
