import React from 'react';
import { useSelector } from 'react-redux';
import { isEmpty, isLoaded, ReduxFirestoreQuerySetting, useFirestoreConnect } from 'react-redux-firebase';
import { useParams as useRouteParams } from 'react-router-dom';
import { ApplicationState } from '../../types/state';
import Column from '../../components/Column';

export interface BoardContextType {
    boardId?: string;
}

export const BoardContext = React.createContext<BoardContextType>({
    boardId: undefined
});

export const Board: React.FC = () => {
    const { id } = useRouteParams();
    const data = useSelector((state: ApplicationState) => state.firestore.data);

    useFirestoreConnect(() => {
        let userQueries: ReduxFirestoreQuerySetting[] = [];
        if (isLoaded(data.members) && !isEmpty(data.members)) {
            userQueries = Object.keys(data.members).map((uid) => ({ collection: 'users', doc: uid }));
        }

        return [
            { collection: 'boards', doc: id },
            { collection: 'boards', doc: id, subcollections: [{ collection: 'members' }], storeAs: 'members' },
            { collection: 'boards', doc: id, subcollections: [{ collection: 'pending' }], storeAs: 'pending' },
            { collection: 'boards', doc: id, subcollections: [{ collection: 'cards' }], storeAs: 'cards' },
            { collection: 'boards', doc: id, subcollections: [{ collection: 'columns' }], storeAs: 'columns' },
            { collection: 'boards', doc: id, subcollections: [{ collection: 'settings' }], storeAs: 'settings' },
            ...userQueries
        ];
    });

    let columns: React.ReactNode[] = [];
    if (isLoaded(data.columns) && !isEmpty(data.columns) && isLoaded(data.cards)) {
        columns = Object.entries(data.columns).map(([columnId, column]) => {
            let cards: any[] = [];
            if (!isEmpty(data.cards)) {
                cards = Object.entries(data.cards)
                    .filter(([cardId, card]) => card.column === columnId)
                    .map(([cardId, card]) => ({
                        id: cardId,
                        ...card
                    }));
            }
            return <Column key={columnId} id={columnId} name={column.name} visible={column.visible} cards={cards} />;
        });
    }

    if (!isLoaded(data.users)) {
        return <>Loading ...</>
    }

    return (
        <BoardContext.Provider value={{ boardId: id }}>
            {columns}
        </BoardContext.Provider>
    );
};

export default Board;
