import React, { useContext, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { BoardContext } from '../routing/pages/Board';
import CardComponent from './Card';
import { addCard } from '../domain/board';
import WithId from '../util/withId';
import { Card } from '../types/state';

export interface ColumnContextType {
    columnId: string;
}

export const ColumnContext = React.createContext<ColumnContextType>({
    columnId: undefined as any
});

export interface ColumnProps {
    id: string;
    name: string;
    visible: boolean;
    cards: WithId<Card>[];
}

export interface ColumnState {
    text?: string;
}

export const Column: React.FC<ColumnProps> = ({ id, name, visible, cards }) => {
    const [state, setState] = useState<ColumnState>({});
    const { boardId, isAdmin } = useContext(BoardContext);

    const onAddCard = () => {
        addCard(boardId, id, state.text).then(() => {
            setState({ ...state, text: undefined });
        });
    };

    return (
        <ColumnContext.Provider value={{ columnId: id }}>
            <div>
                <p>{name}</p>

                {isAdmin && (
                    <p>
                        <Button>Toggle Visibility</Button>
                    </p>
                )}

                <TextField label="Add card" value={state.text || ''} onChange={(event) => setState({ ...state, text: event.target.value })} />
                <Button onClick={onAddCard}>Add card</Button>
                <ul>
                    {cards.map((card) => (
                        <li key={card.id}>
                            <CardComponent {...card} />
                        </li>
                    ))}
                </ul>
            </div>
        </ColumnContext.Provider>
    );
};

export default Column;
