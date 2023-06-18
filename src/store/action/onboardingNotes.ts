export const OnboardingNoteAction = {
  RegisterOnboardingNote: "scrumlr.io/registerOnboardingNote" as const,
  ClearOnboardingNotes: "scrumlr.io/clearOnboardingNotes" as const,
};

export const OnboardingNoteActionFactory = {
  registerOnboardingNote: (noteId: string, onboardingAuthor: string, votes: number) => ({
    type: OnboardingNoteAction.RegisterOnboardingNote,
    noteId,
    onboardingAuthor,
    votes,
  }),
  clearOnboardingNotes: () => ({
    type: OnboardingNoteAction.ClearOnboardingNotes,
  }),
};

export type OnboardingNoteReduxAction = ReturnType<typeof OnboardingNoteActionFactory.registerOnboardingNote> | ReturnType<typeof OnboardingNoteActionFactory.clearOnboardingNotes>;
