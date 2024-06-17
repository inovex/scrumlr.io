import {Participant} from "types/participant";

export default (overwrite?: Partial<Participant>): Participant => ({
  user: {
    id: "test-participant-id",
    name: "test-participant-name",
    anonymous: true,
  },
  connected: true,
  ready: false,
  raisedHand: false,
  showHiddenColumns: false,
  role: "PARTICIPANT",
  ...overwrite,
});
