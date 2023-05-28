import {Action, ReduxAction} from "store/action";
import { OnboardingState } from "types/onboarding";

const initialState: OnboardingState = {
  phase: "none",
  step: 1,
  stepOpen: false,
}

export const onboardingReducer = (state: OnboardingState = initialState, action: ReduxAction ): OnboardingState => {
  switch (action.type) {
    case Action.ChangePhase: {
      return {
        ...state,
        phase: action.phase,
        step: 1,
        stepOpen: true
      };
    }
    case Action.IncrementStep: {
      return {
        ...state,
        step: state.step + 1
      };
    }
    case Action.DecrementStep: {
      return {
        ...state,
        step: state.step - 1
      };
    }
    case Action.ToggleStepOpen: {
      return {
        ...state,
        stepOpen: !state.stepOpen
      };
    }
    default:
      return state;
  }
}
