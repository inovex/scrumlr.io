import {Action, ReduxAction} from "store/action";
import {OnboardingNotesState} from "types/onboardingNotes";

const initialState: OnboardingNotesState = JSON.parse(sessionStorage.getItem("onboardingNotes") ?? "[]");

export const onboardingNoteReducer = (state: OnboardingNotesState = initialState, action: ReduxAction): OnboardingNotesState => {
  if (action.type === Action.RegisterOnboardingNote) {
    const newState = [...state];
    newState.push({id: action.noteId, onboardingAuthor: action.onboardingAuthor});
    return newState;
  }

  return state;
};
