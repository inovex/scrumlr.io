import {Request as RequestModel} from "store/features/requests/types";
import "./Requests.scss";
import {Participant} from "store/features/participants/types";
import {useAppDispatch} from "store";
import {acceptJoinRequests, rejectJoinRequests, setRaisedHandStatus} from "store/features";
import {Request} from "./Request";

export interface RequestsProps {
  requests: RequestModel[];
  participantsWithRaisedHand: Participant[];
}

export const Requests = ({requests, participantsWithRaisedHand}: RequestsProps) => {
  const dispatch = useAppDispatch();

  const handleJoin = (userId: string, acceptJoin?: boolean) => {
    if (acceptJoin) {
      dispatch(acceptJoinRequests([userId]));
    } else {
      dispatch(rejectJoinRequests([userId]));
    }
  };

  const lowerHand = (userId: string) => {
    dispatch(setRaisedHandStatus({userId, raisedHand: false}));
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
