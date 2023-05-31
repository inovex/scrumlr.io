
export const OnboardingNoteAction = {
  RegisterOnboardingNote: "scrumlr.io/registerOnboardingNote" as const
}

export const OnboardingNoteActionFactory = {
  registerOnboardingNote: (noteId: string, onboardingAuthor: string) => ({
    type: OnboardingNoteAction.RegisterOnboardingNote,
    noteId,
    onboardingAuthor
  })
}

export type OnboardingNoteReduxAction =
  | ReturnType<typeof OnboardingNoteActionFactory.registerOnboardingNote>
