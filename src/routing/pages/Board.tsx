import React from 'react';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import { useParams as useRouteParams } from 'react-router-dom';
import { Card } from '../../types/state';
import { Column } from '../../components/Column';
import { WithId, mapWithId } from '../../util/withId';
import { BoardAccessState, useBoardGuard } from '../util/useBoardGuard';
import { BoardContext } from './BoardContext';

export const Board: React.FC = () => {
  const { id } = useRouteParams();
  const guard = useBoardGuard(id!);

  if (guard.state === BoardAccessState.PENDING) {
    return <div>Loading ...</div>;
  }
  if (guard.state === BoardAccessState.DENIED) {
    return <div>Denied!</div>;
  }
  const { cards, columns, users } = guard.database;

  let columnComponents: React.ReactNode[] = [];

  if (isLoaded(columns) && !isEmpty(columns) && isLoaded(cards)) {
    columnComponents = Object.entries(columns).map(([columnId, column]) => {
      let cardsWithId: WithId<Card>[] = [];
      if (!isEmpty(cards)) {
        cardsWithId = mapWithId<Card>(cards).filter((card) => card.column === columnId);
      }
      return <Column key={columnId} id={columnId} name={column.name} visible={column.visible} cards={cardsWithId} />;
    });
  }

  if (!isLoaded(users)) {
    return <>Loading ...</>;
  }

  return <BoardContext.Provider value={{ boardId: id, isAdmin: guard.isAdmin }}>{columnComponents}</BoardContext.Provider>;
};

export default Board;
