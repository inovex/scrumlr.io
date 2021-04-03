import * as React from 'react';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import {AuthenticationManager} from 'utils/authentication/AuthenticationManager';
import getRandomName from '../../constants/Name';
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "../../api";

export interface NewBoardProps extends RouteComponentProps {}

function NewBoard(props: NewBoardProps) {

    const [name, setName] = React.useState(getRandomName());
    function handleChangeName(e: any) {
        const name = (e.target as HTMLInputElement).value;
        setName(name);
    }

    async function onAnonymousLogin() {
        await AuthenticationManager.signInAnonymously(name);
        await onCreateBoard();
    }

    async function onGoogleSignIn() {
        const redirectURI = await API.signInWithGoogle(window.location.href);
        window.location.href = redirectURI;
    }

    async function onCreateBoard() {
        if (Parse.User.current()) {
            const boardId = await API.createBoard([
                { name: 'Positive', hidden: false },
                { name: 'Negative', hidden: false },
                { name: 'Actions', hidden: true }
            ]);
            props.history.push(`/board/${boardId}`);
        }
        // TODO report error
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
                      onAnonymousLogin();
                    }
                }}
                inputProps={{
                    maxLength: 20
                }}
            />
            <Button onClick={onAnonymousLogin}>Login</Button>
            <Button onClick={onGoogleSignIn}>Sign in with Google</Button>
        </div>
    );
}

export default NewBoard;