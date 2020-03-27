import React, { useContext, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { getFirebase } from 'react-redux-firebase';
import { BoardContext } from '../routing/pages/Board';
import Card from './Card';

export interface ColumnContextType {
    columnId?: string;
}

export const ColumnContext = React.createContext<ColumnContextType>({
    columnId: undefined
});

export interface ColumnProps {
    id: string;
    name: string;
    visible: boolean;
    cards: any[];
}

export interface ColumnState {
    text?: string;
}

export const Column: React.FC<ColumnProps> = ({ id, name, visible, cards }) => {
    const [state, setState] = useState<ColumnState>({});
    const { boardId, isAdmin } = useContext(BoardContext);

    const onAddCard = () => {
        getFirebase()
            .firestore()
            .collection('boards')
            .doc(boardId!)
            .collection('cards')
            .add({
                author: getFirebase().auth().currentUser!.uid,
                column: id,
                text: state.text
            })
            .then(() => {
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

                <TextField label="Add card" value={state.text} onChange={(event) => setState({ ...state, text: event.target.value })} />
                <Button onClick={onAddCard}>Add card</Button>
                <ul>
                    {cards.map((card) => (
                        <li key={card.id}>
                            <Card id={card.id} text={card.text} author={card.author} />
                        </li>
                    ))}
                </ul>
            </div>
        </ColumnContext.Provider>
    );
};

export default Column;
