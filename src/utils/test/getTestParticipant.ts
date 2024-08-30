import {Participant} from "store/features/participants/participant";

export default (overwrite?: Partial<Participant>): Participant => ({
  user: {
    id: "test-participant-id",
    name: "test-participant-name",
    isAnonymous: true,
  },
  connected: true,
  ready: false,
  raisedHand: false,
  showHiddenColumns: false,
  role: "PARTICIPANT",
  ...overwrite,
});
