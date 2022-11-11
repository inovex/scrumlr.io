import {Participant} from "types/participant";

export const FocusAction = {
  SetInitiator: "scrumlr.io/setInitiator" as const,
  ClearInitiator: "scrumlr.io/clearInitiator" as const,
};

export const FocusFactory = {
  setFocusInitiator: (participant: Participant) => ({
    type: FocusAction.SetInitiator,
    participant,
  }),

  clearFocusInitiator: () => ({
    type: FocusAction.ClearInitiator,
  }),
};

export type FocusReduxAction = ReturnType<typeof FocusFactory.setFocusInitiator> | ReturnType<typeof FocusFactory.clearFocusInitiator>;
