import { getFirebase, getVal } from 'react-redux-firebase';
import { sortBy } from 'lodash';
import * as Raven from 'raven-js';

import { BoardCards, Card, StoreState } from '../../types';
import { OwnCardProps, StateCardProps } from './Card';
import { AnyAction, Dispatch } from 'redux';
import { EDIT_STATUS } from '../../actions';
import { CRYPTO } from '../../util/global';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnCardProps
): StateCardProps => {
  const author = getVal(
    state.fbState,
    `data/${ownProps.boardId}/users/${ownProps.card.authorUid}`,
    undefined
  );
  const user = getVal(state.fbState, 'auth', undefined);
  const isShowAuthor = getVal(
    state.fbState,
    `data/${ownProps.boardId}/config/showAuthor`,
    false
  );
  const admin =
    getVal(
      state.fbState,
      `data/${ownProps.boardId}/config/creatorUid`,
      undefined
    ) === user.uid;
  const cards: { [key: string]: Card } = getVal(
    state.fbState,
    `data/${ownProps.boardId}/cards`,
    {}
  );

  const unstackCard = (oldParentKey: string) => {
    // Choose a new parent for the card's children
    let newParentKey = Object.keys(cards).find(
      k => cards[k].parent === oldParentKey
    );

    const toUpdate = {};
    if (newParentKey) {
      // Reattach all children to new parent, if it exists
      Object.keys(cards).forEach(k => {
        if (cards[k].parent === oldParentKey && k !== newParentKey) {
          toUpdate[`${k}/parent`] = newParentKey;
        }
      });

      // Attach new parent back to the "binary tree" and remove old card from it
      toUpdate[`${newParentKey}/parent`] = cards[oldParentKey].parent || null;
    }

    toUpdate[`${oldParentKey}/parent`] = null;

    return toUpdate;
  };

  async function onRemoveCard(key: string) {
    const { focusedCardId } = getVal(
      state.fbState,
      `data/${ownProps.boardId}/config`,
      {}
    );

    if (focusedCardId === key) {
      await getFirebase()
        .ref(`${ownProps.boardId}/config/focusedCardId`)
        .remove();
    }

    await getFirebase()
      .ref(`${ownProps.boardId}/cards`)
      .update(unstackCard(key))
      .catch((err: Error) => {
        Raven.captureMessage('Could change parent of card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId,
            cardId: key
          }
        });
      });

    await getFirebase()
      .ref(`${ownProps.boardId}/cards/${key}`)
      .remove()
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
      getFirebase()
        .ref(`${ownProps.boardId}/cards/${cardSourceId}`)
        .update({
          type: columnTargetId
        });
    }
  }

  function onUpdateCardText(key: string, text: string, iv: string) {
    CRYPTO.encrypt(text, iv).then(value => {
      getFirebase()
        .ref(`${ownProps.boardId}/cards/${key}`)
        .update({ text: value })
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
    });
  }

  function onStackCards(cardSourceId: string, cardTargetId: string) {
    if (
      cards[cardSourceId].type === cards[cardTargetId].type &&
      cardSourceId !== cardTargetId
    ) {
      getFirebase()
        .ref(`${ownProps.boardId}/cards/${cardTargetId}`)
        .update({
          parent: cardSourceId
        });
      // set new timestamp on source card, so that order will be maintained in the stack
      const newTimestamp = cards[cardTargetId].timestamp;

      getFirebase()
        .ref(`${ownProps.boardId}/cards/${cardSourceId}`)
        .update({
          timestamp: newTimestamp
        });
    }
  }

  function onUnstackCard(key: string) {
    getFirebase()
      .ref(`${ownProps.boardId}/cards`)
      .update(unstackCard(key))
      .catch((err: Error) => {
        Raven.captureMessage('Could change parent of card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardId,
            cardId: key
          }
        });
      });
  }

  function onFocusCard(cardId: string) {
    const { focusedCardId } = getVal(
      state.fbState,
      `data/${ownProps.boardId}/config`,
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
      const temp = keys.reduce(
        (acc, key: string) => {
          const item = { key };
          acc[key] = key;
          sortKeys.forEach(sk => (item[sk] = bc[key][sk]));
          acc.push(item);
          return acc;
        },
        [] as any[]
      ); // tslint:disable-line
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
        getVal(state.fbState, `data/${ownProps.boardId}/config/sorted`, {})
      );

      return keys
        .filter(key => getRootCard(key) === parentId)
        .map(key => Object.assign({}, cards[key], { id: key }));
    };
  };

  const focusedCardId: string = getVal(
    state.fbState,
    `data/${ownProps.boardId}/config/focusedCardId`,
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
    votes: ownProps.card.votes,

    getCardsInTheStack: getCardsInTheStack(ownProps.card.id || ''),
    onRemove: onRemoveCard,
    onUpvote: (key: string) => onUpdateVoteForCard(key, +1),
    onColumnStack: onColumnStack,
    onDownvote: (key: string) => onUpdateVoteForCard(key, -1),
    onUpdateText: onUpdateCardText,
    onShowVotes: () => {},
    onCardStack: onStackCards,
    onCardUnstack: onUnstackCard,
    onFocus: onFocusCard,
    isShowAuthor
  };
};

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    onEditMode: (active: boolean) => {
      dispatch({ type: EDIT_STATUS, isActive: active });
    }
  };
}
