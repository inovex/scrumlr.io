import * as React from 'react';
import { useFirestore } from 'react-redux-firebase';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import {AuthenticationManager} from 'utils/authentication/AuthenticationManager';
import BoardData from "types/BoardData";
import firebase from 'firebaseSetup';

import getRandomName from 'constants/Name';
import {RouteComponentProps} from "react-router";

interface NewBoardProps extends RouteComponentProps {}

function NewBoard(props: NewBoardProps) {

    const firestore = useFirestore();

    let auth = firebase.auth().currentUser;

    const [name, setName] = React.useState(getRandomName());
    function handleChangeName(e: any) {
        const name = (e.target as HTMLInputElement).value;
        setName(name);
    }

    function handleLogin() {
        AuthenticationManager.signInAnonymously(name).then(_ => {
            auth?.reload();
            createBoard();
        });
    }

    function createBoard() {
        const newBoard: BoardData = {
            owner: auth!.uid,
            topic: "Test",
            date: (firestore.Timestamp as any).fromDate(new Date()),
            config: {
                private: true,
                encryption: false,
                maxVotes: 5,
                multiVote: true,
                hideVotes: false
            }
        };

        firestore.collection('boards').add(newBoard).then(success => {
            firestore.collection('boards').doc(success.id).collection('participants').doc(auth!.uid).set({
                name: auth!.displayName,
                admin: true
            });
            props.history.push(`/board/${success.id}`);
        });
    }

    return (
        <div className='new-board'>
            <Input
                className='new-board__input'
                defaultValue={name}
                type='text'
                onChange={handleChangeName}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
            />
            <Button onClick={handleLogin}>Login</Button>
        </div>
    );
}

export default NewBoard;