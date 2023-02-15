import {Participant} from "types/participant";

export default (overwrite?: Partial<Participant>): Participant => ({
  user: {
    id: "test-participant-id",
    name: "test-participant-name",
  },
  connected: true,
  ready: false,
  raisedHand: false,
  viewsSharedNote: false,
  showHiddenColumns: false,
  role: "PARTICIPANT",
  ...overwrite,
});
