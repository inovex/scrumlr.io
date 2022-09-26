import "./Request.scss";
import {Participant} from "../../../types/participant";

export type RequestProps = {
  participant: Participant;
};

export const Request = ({participant}: RequestProps) => (
    <div className="request__container">
      <div>(Avatar)</div>
      <div>({participant.user.name})</div>
      <div>(Click)</div>
    </div>
  );
