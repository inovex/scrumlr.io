import { getFirebase } from 'react-redux-firebase';
import * as Raven from 'raven-js';

import { Card, StoreState } from '../../types/index';
import { AddCardOwnProps, AddCardProps } from './AddCard';
import { ColumnType } from '../../constants/Retrospective';

export const mapStateToProps = (
  store: StoreState,
  ownProps: AddCardOwnProps
): AddCardProps => {
  // TODO: Currently the third parameter, timestamp, is needed for testing.
  // Can this be done by mocking the `Date.now` method in Jest?
  function onAddCard(type: ColumnType, value: string, timestamp?: string) {
    if (value.length === 0) {
      return;
    }
    const { currentUser: user } = getFirebase().auth();
    if (!user) {
      return;
    }
    const authorName = user.displayName;
    const authorImage = user.photoURL;
    const card: Card = {
      authorUid: user.uid,
      author: authorName,
      image: authorImage,
      text: value,
      type,
      votes: 0,
      timestamp: timestamp || new Date().toJSON(),
      userVotes: {
        [user.uid]: 0
      }
    };
    getFirebase()
      .ref(`${ownProps.boardId}/cards`)
      .push(card)
      .catch((err: Error) => {
        Raven.captureMessage('Could not create new card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId
          }
        });
      });
  }

  return {
    onAdd: onAddCard,
    ...ownProps
  };
};
