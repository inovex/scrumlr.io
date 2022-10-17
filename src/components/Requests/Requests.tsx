import {Actions} from "store/action";
import {Request as RequestModel} from "types/request";
import "./Request.scss";
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

  return requests.length !== 0 || participantsWithRaisedHand.length !== 0 ? (
    <div className="requests__wrapper">
      <div className="requests__main">
        {/* join requests */}
        {requests.map((p) => (
          <Request key={p.user.id} type="JOIN" participant={p.user} handleClick={handleJoin} />
        ))}

        {/* raise hand requests */}
        {participantsWithRaisedHand.map((p) => (
          <Request key={p.user.id} type="RAISE_HAND" participant={p.user} handleClick={lowerHand} />
        ))}
      </div>
    </div>
  ) : null;
};
