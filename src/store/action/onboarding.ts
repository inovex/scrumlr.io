import { OnboardingPhase } from "types/onboarding";

export const OnboardingAction = {
  ChangePhase: "scrumlr.io/changePhase" as const,
  IncrementStep: "scrumlr.io/incrementStep" as const,
  AddOnboardingColumn: "scrumlr.io/addOnboardingColumn" as const,
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
  addOnboardingColumn: (columnId: string, title: string) => ({
    type: OnboardingAction.AddOnboardingColumn,
    columnId,
    title
  }),
  toggleStepOpen: () => ({
    type: OnboardingAction.ToggleStepOpen
  }),
}

export type OnboardingReduxAction =
  | ReturnType<typeof OnboardingActionFactory.changePhase>
  | ReturnType<typeof OnboardingActionFactory.incrementStep>
  | ReturnType<typeof OnboardingActionFactory.addOnboardingColumn>
  | ReturnType<typeof OnboardingActionFactory.toggleStepOpen>
