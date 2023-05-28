import {Action, ReduxAction} from "store/action";
import { OnboardingState } from "types/onboarding";

const initialState: OnboardingState = {
  phase: "none",
  step: 1
}

export const onboardingReducer = (state: OnboardingState = initialState, action: ReduxAction ): OnboardingState => {
  switch (action.type) {
    case Action.ChangePhase: {
      state.phase = action.phase
      state.step = 1;
      return state;
    }
    case Action.IncrementStep: {
      state.step++;
      return state;
    }
    case Action.DecrementStep: {
      state.step--;
      return state;
    }
    default:
      return state;
  }
}
