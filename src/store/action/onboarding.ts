import { OnboardingPhase } from "types/onboarding";

export const OnboardingAction = {
  ChangePhase: "scrumlr.io/changePhase" as const,
  IncrementStep: "scrumlr.io/incrementStep" as const,
  DecrementStep: "scrumlr.io/decrementStep" as const,
  ToggleStepOpen: "scrumlr.io/toggleStepOpen" as const,
}

export const OnboardingActionFactory = {
  changePhase: (phase: OnboardingPhase) => ({
    type: OnboardingAction.ChangePhase,
    phase
  }),
  incrementStep: () => ({
    type: OnboardingAction.IncrementStep
  }),
  decrementStep: () => ({
    type: OnboardingAction.DecrementStep
  }),
  toggleStepOpen: () => ({
    type: OnboardingAction.ToggleStepOpen
  }),
}

export type OnboardingReduxAction =
  | ReturnType<typeof OnboardingActionFactory.changePhase>
  | ReturnType<typeof OnboardingActionFactory.incrementStep>
  | ReturnType<typeof OnboardingActionFactory.decrementStep>
  | ReturnType<typeof OnboardingActionFactory.toggleStepOpen>
