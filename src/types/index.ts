import {BoardState} from "../store/features/board/board";
import {VotesState} from "../store/features/votes/vote";
import {AuthState} from "../store/features/auth/auth";
import {RequestsState} from "../store/features/requests/request";
import {VotingsState} from "../store/features/votings/voting";
import {ColumnsState} from "../store/features/columns/column";
import {ParticipantsState} from "../store/features/participants/participant";
import {NotesState} from "../store/features/notes/note";
import {ViewState} from "../store/features/view/view";
import {ReactionState} from "../store/features/reactions/reaction";
import {BoardReactionState} from "../store/features/boardReactions/boardReaction";
import {SkinToneState} from "../store/features/skinTone/skinTone";

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
