import { Action, ReduxAction } from "store/action";
import { OnboardingNotesState } from "types/onboardingNotes";

export const onboardingNoteReducer = (state: OnboardingNotesState = [], action: ReduxAction): OnboardingNotesState => {
  if (action.type === Action.RegisterOnboardingNote) {
    const newState = [...state];
    newState.push({id: action.noteId, onboardingAuthor: action.onboardingAuthor});
    return newState
  }

  return state
}
