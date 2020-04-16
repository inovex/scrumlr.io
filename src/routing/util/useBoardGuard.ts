import { isEmpty, isLoaded, ReduxFirestoreQuerySetting, useFirestoreConnect } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../../types/state';
import { useState } from 'react';
import { getCurrentUser } from '../../domain/auth';
import { addMember, addToAdmissionControl } from '../../domain/board';

export enum BoardAccessState {
  DENIED,
  PENDING,
  APPROVED,
}

export interface BoardGuardState {
  databaseQueries: ReduxFirestoreQuerySetting[];
  isOwnerCheckCompleted: boolean;
  isPendingQueryAdded: boolean;
  isMember: boolean;
  isAdmin: boolean;
  boardAccessEvaluationResult: BoardAccessState;
}

export const useBoardGuard = (id: string) => {
  const [state, setState] = useState<BoardGuardState>({
    databaseQueries: [],
    isOwnerCheckCompleted: false,
    isPendingQueryAdded: false,
    isMember: false,
    isAdmin: false,
    boardAccessEvaluationResult: BoardAccessState.PENDING,
  });
  const { boards, members, pending, cards, columns, users } = useSelector((store: ApplicationState) => store.firestore.data);
  useFirestoreConnect(() => {
    let userQueries: ReduxFirestoreQuerySetting[] = [];
    if (isLoaded(members) && !isEmpty(members)) {
      userQueries = Object.keys(members).map((uid) => ({ collection: 'users', doc: uid }));
    }
    return [
      { collection: 'boards', doc: id },
      { collection: 'boards', doc: id, subcollections: [{ collection: 'members' }], storeAs: 'members' },
      { collection: 'boards', doc: id, subcollections: [{ collection: 'pending' }], storeAs: 'pending' },
      { collection: 'boards', doc: id, subcollections: [{ collection: 'cards' }], storeAs: 'cards' },
      { collection: 'boards', doc: id, subcollections: [{ collection: 'columns' }], storeAs: 'columns' },
      ...userQueries,
      ...state.databaseQueries,
    ];
  });

  if (state.boardAccessEvaluationResult === BoardAccessState.PENDING) {
    const currentUserUid = getCurrentUser()!.uid;
    if (isLoaded(boards) && !isEmpty(boards) && Boolean(boards[id!])) {
      const boardPublicSettings = boards[id!];

      if (!state.isOwnerCheckCompleted) {
        const isOwner = boardPublicSettings.owner === currentUserUid;
        setState({
          ...state,
          isMember: isOwner,
          isAdmin: isOwner,
          isOwnerCheckCompleted: true,
          boardAccessEvaluationResult: isOwner ? BoardAccessState.APPROVED : BoardAccessState.PENDING,
          databaseQueries: [],
        });
      } else if (!state.isMember && !state.isAdmin) {
        if (boardPublicSettings.admissionControl) {
          // check if already added as pending or add to pending and wait for result
          if (state.isPendingQueryAdded) {
            if (isLoaded(pending)) {
              if (isEmpty(pending) || pending[currentUserUid] === null || pending[currentUserUid].approved === null || pending[currentUserUid].approved === undefined) {
                addToAdmissionControl(id, currentUserUid);
              } else if (pending[currentUserUid].approved) {
                setState({ ...state, boardAccessEvaluationResult: BoardAccessState.APPROVED, databaseQueries: [] });
              } else {
                setState({ ...state, boardAccessEvaluationResult: BoardAccessState.DENIED, databaseQueries: [] });
              }
            }
          } else {
            setState({
              ...state,
              isPendingQueryAdded: true,
              databaseQueries: [...state.databaseQueries, { collection: 'boards', doc: id, subcollections: [{ collection: 'pending', doc: currentUserUid }], storeAs: 'pending' }],
            });
          }
        } else if (isLoaded(members) && !isEmpty(members)) {
          if (Object.keys(members).indexOf(currentUserUid) >= 0) {
            setState({
              ...state,
              isMember: true,
              isAdmin: members[currentUserUid].admin,
              boardAccessEvaluationResult: BoardAccessState.APPROVED,
              databaseQueries: [],
            });
          } else {
            addMember(id!, currentUserUid, false);
          }
        }
      }
    }
  }

  return {
    state: state.boardAccessEvaluationResult,
    isAdmin: state.isAdmin,
    database: {
      boards,
      members,
      pending,
      cards,
      columns,
      users,
    },
  };
};
