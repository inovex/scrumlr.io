import {BoardState} from "../store/features/board/types";
import {VotesState} from "../store/features/votes/types";
import {AuthState} from "../store/features/auth/types";
import {RequestsState} from "../store/features/requests/types";
import {VotingsState} from "../store/features/votings/types";
import {ColumnsState} from "../store/features/columns/types";
import {ParticipantsState} from "../store/features/participants/types";
import {NotesState} from "../store/features/notes/types";
import {ViewState} from "../store/features/view/types";
import {ReactionState} from "../store/features/reactions/types";
import {BoardReactionState} from "../store/features/boardReactions/types";
import {SkinToneState} from "../store/features/skinTone/types";

export interface ApplicationState {
  auth: AuthState;
  board: BoardState;
  requests: RequestsState;
  participants: ParticipantsState;
  columns: ColumnsState;
  notes: NotesState;
  reactions: ReactionState;
  votes: VotesState;
  votings: VotingsState;
  view: ViewState;
  boardReactions: BoardReactionState;
  skinTone: SkinToneState;
}
