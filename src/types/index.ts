import { AppState } from '../reducers';
import { ColumnType } from '../constants/Retrospective';
import { RetroMode } from '../constants/mode';

export type FirebaseProp = firebase.auth.Auth &
  firebase.app.App &
  firebase.database.Database &
  firebase.database.Reference;

export interface StoreState {
  fbState: FirebaseState;
  app: AppState;
}

export interface FirebaseState {
  auth?: {
    uid: string;
    displayName: string;
    photoURL: string;
  };
  data?: {
    boards: Boards;
    presence?: {
      [key: string]: boolean;
    };
  };
}

export interface Card {
  id?: string;
  authorUid: string;
  author: string | null;
  image: string | null;
  text: string;
  type: string;
  theme: ColumnType;
  votes: number;
  timestamp: string;
  parent?: string;
  userVotes: {
    [key: string]: number;
  };
}

export interface BoardConfig {
  sorted: boolean;
  users: BoardUsers;
  creatorUid: string | null;
  guided: boolean;
  guidedPhase: number;
  focusedCardId?: string;
  created: string;
  name?: string;
  mode: RetroMode;
}

export interface UserInformation {
  name: string;
  image: string;
  ready: boolean;
}

export interface BoardUsers {
  [key: string]: UserInformation;
}

export interface BoardCards {
  [key: string]: Card;
}

export interface Boards {
  [key: string]: Board;
}

export interface Board {
  config: BoardConfig;
  cards?: BoardCards;
}

export interface BoardProp {
  boardId: string;
}

export interface DragAndDropProps {
  isDragging?: any;
  connectDragSource?: any;
  dragSource?: any;
  connectDropTarget?: any;
  isOver?: any;
  canDrop?: any;
}

export type ModalType = 'settings' | 'feedback' | 'donate' | 'share';
