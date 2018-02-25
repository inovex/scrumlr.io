import { dataToJS, getFirebase, helpers } from 'react-redux-firebase';
import pathToJS = helpers.pathToJS;
import { sortBy } from 'lodash';
import * as Raven from 'raven-js';

import { BoardCards, Card, StoreState } from '../../types';
import { CardProps, StateCardProps } from './Card';
import { Dispatch } from 'redux';
import { EDIT_STATUS } from '../../actions';

export const mapStateToProps = (
  state: StoreState,
  ownProps: CardProps
): StateCardProps => {
  const author = dataToJS(
    state.fbState,
    `${ownProps.boardId}/config/users/${ownProps.card.authorUid}`,
    undefined
  );
  const user = pathToJS(state.fbState, 'auth', undefined);
  const admin =
    dataToJS(
      state.fbState,
      `${ownProps.boardId}/config/creatorUid`,
      undefined
    ) === user.uid;
  const cards: { [key: string]: Card } = dataToJS(
    state.fbState,
    `${ownProps.boardId}/cards`,
    {}
  );

  function onRemoveCard(key: string) {
    Object.keys(cards).forEach(k => {
      if (cards[k].parent === key) {
        getFirebase()
          .ref(`${ownProps.boardId}/cards/${k}`)
          .set({
            ...cards[k],
            parent: null
          })
          .catch((err: Error) => {
            Raven.captureMessage('Could change parent of card', {
              extra: {
                reason: err.message,
                uid: user.uid,
                boardId: ownProps.boardId,
                cardId: cards[k].id
              }
            });
          });
      }
    });

    getFirebase()
      .ref(`${ownProps.boardId}/cards/${key}`)
      .set(null)
      .catch((err: Error) => {
        Raven.captureMessage('Could not remove card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId,
            cardId: key
          }
        });
      });
  }

  function onUpdateVoteForCard(key: string, inc: number) {
    // Don't do anything in case we should downvote a card that has no
    // votes at all.
    if (inc < 0 && cards[key].votes === 0) {
      return;
    }

    getFirebase()
      .ref(`${ownProps.boardId}/cards/${key}/votes`)
      .transaction((value: number) => (value || 0) + inc)
      .catch((err: Error) => {
        Raven.captureMessage('Could not update votes on card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId,
            cardId: key
          }
        });
      });
    getFirebase()
      .ref(`${ownProps.boardId}/cards/${key}/userVotes/${user.uid}`)
      .transaction((value: number) => (value || 0) + inc)
      .catch((err: Error) => {
        Raven.captureMessage('Could not update userVotes on card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId,
            cardId: key
          }
        });
      });
  }

  function onColumnStack(cardSourceId: string, columnTargetId: string) {
    if (cards[cardSourceId].type !== columnTargetId) {
      getFirebase().ref(`${ownProps.boardId}/cards/${cardSourceId}`).update({
        ...cards[cardSourceId],
        type: columnTargetId
      });
    }
  }

  function onUpdateCardText(key: string, text: string) {
    getFirebase()
      .ref(`${ownProps.boardId}/cards/${key}`)
      .update({ text })
      .catch((err: Error) => {
        Raven.captureMessage('Could not update text on card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId,
            cardId: key
          }
        });
      });
  }

  function onStackCards(cardSourceId: string, cardTargetId: string) {
    if (
      cards[cardSourceId].type === cards[cardTargetId].type &&
      cardSourceId !== cardTargetId
    ) {
      getFirebase().ref(`${ownProps.boardId}/cards/${cardTargetId}`).update({
        ...cards[cardTargetId],
        parent: cardSourceId
      });

      const userVotes = cards[cardSourceId].userVotes;
      Object.keys(cards[cardTargetId].userVotes).forEach(userId => {
        userVotes[userId] =
          (userVotes[userId] || 0) + cards[cardTargetId].userVotes[userId];
      });
      const votes =
        (cards[cardSourceId].votes || 0) + (cards[cardTargetId].votes || 0);

      getFirebase().ref(`${ownProps.boardId}/cards/${cardSourceId}`).update({
        ...cards[cardSourceId],
        userVotes,
        votes
      });
    }
  }

  function onStackCardsReverse(cardSourceId: string, cardTargetId: string) {
    if (
      cards[cardSourceId].type === cards[cardTargetId].type &&
      cardSourceId !== cardTargetId
    ) {
      getFirebase().ref(`${ownProps.boardId}/cards/${cardSourceId}`).update({
        ...cards[cardSourceId],
        parent: cardTargetId
      });

      const userVotes = cards[cardTargetId].userVotes;
      Object.keys(cards[cardSourceId].userVotes).forEach(userId => {
        userVotes[userId] =
          (userVotes[userId] || 0) + cards[cardSourceId].userVotes[userId];
      });
      const votes =
        (cards[cardTargetId].votes || 0) + (cards[cardSourceId].votes || 0);

      getFirebase().ref(`${ownProps.boardId}/cards/${cardTargetId}`).update({
        ...cards[cardTargetId],
        userVotes,
        votes
      });
    }
  }

  function onFocusCard(cardId: string) {
    const { focusedCardId } = dataToJS(
      state.fbState,
      `${ownProps.boardId}/config`,
      {}
    );
    getFirebase()
      .ref(`${ownProps.boardId}/config/focusedCardId`)
      .set(focusedCardId !== cardId ? cardId : null)
      .catch((err: Error) => {
        Raven.captureMessage('Could not set focus on card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId,
            cardId
          }
        });
      });
  }

  const sortCardKeys = (cards: BoardCards, sortByVotes: boolean) => {
    const doSortKey = (bc: BoardCards, sortKeys: string[]) => {
      let keys = Object.keys(bc);
      const temp = keys.reduce((acc, key: string) => {
        const item = { key };
        acc[key] = key;
        sortKeys.forEach(sk => (item[sk] = bc[key][sk]));
        acc.push(item);
        return acc;
      }, [] as any[]); // tslint:disable-line
      const sortedKeys = sortBy(temp, sortKeys).map(obj => obj.key);
      sortedKeys.reverse();
      keys = sortedKeys;
      return keys;
    };
    return doSortKey(
      cards,
      sortByVotes ? ['votes', 'timestamp'] : ['timestamp']
    );
  };

  const getRootCard = (
    cardId: string,
    hasParent: boolean = false
  ): string | undefined => {
    if (cards[cardId].parent) {
      if (cardId !== cards[cardId].parent) {
        return getRootCard(cards[cardId].parent as string, true);
      }
    }
    if (hasParent) {
      return cardId;
    }
    return undefined;
  };

  const getCardsInTheStack = (parentId: string) => {
    return (): Card[] => {
      const keys = sortCardKeys(
        cards,
        dataToJS(state.fbState, `${ownProps.boardId}/config/sorted`, {})
      );

      return keys
        .filter(key => getRootCard(key) === parentId)
        .map(key => Object.assign({}, cards[key], { id: key }));
    };
  };

  const focusedCardId: string = dataToJS(
    state.fbState,
    `${ownProps.boardId}/config/focusedCardId`,
    undefined
  );

  return {
    id: ownProps.card.id || '',
    author: {
      name: author.name,
      image: author.image
    },
    isAdmin: admin,
    column: '',
    editable: admin || user.uid === ownProps.card.authorUid,
    deletable: admin || user.uid === ownProps.card.authorUid,
    isFocusable: admin,
    isFocused: focusedCardId == ownProps.card.id,
    owner: user.uid === ownProps.card.authorUid,
    stacked: Boolean(ownProps.card.parent),
    ownVotes: ownProps.card.userVotes[user.uid],
    votes: ownProps.showVotes ? ownProps.card.votes : null,

    getCardsInTheStack: getCardsInTheStack(ownProps.card.id || ''),
    onRemove: onRemoveCard,
    onUpvote: (key: string) => onUpdateVoteForCard(key, +1),
    onColumnStack: onColumnStack,
    onDownvote: (key: string) => onUpdateVoteForCard(key, -1),
    onUpdateText: onUpdateCardText,
    onShowVotes: () => {},
    onCardStack: onStackCards,
    onCardStackReversed: onStackCardsReverse,
    onFocus: onFocusCard
  };
};

export function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {
    onEditMode: (active: boolean) => {
      dispatch({ type: EDIT_STATUS, isActive: active });
    }
  };
}
