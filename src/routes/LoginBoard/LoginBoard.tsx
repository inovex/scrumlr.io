import * as React from 'react';
import {RouteComponentProps} from "react-router";
import getRandomName from "../../constants/Name";
import {AuthenticationManager} from "../../utils/authentication/AuthenticationManager";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import firebase from 'firebaseSetup';

function LoginBoard(props: RouteComponentProps) {

    const [name, setName] = React.useState(getRandomName());
    function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value;
        setName(name);
    }

    function handleLogin() {
        AuthenticationManager.signInAnonymously(name).then(_ => {
            //TODO: Workaround because react-redux-firebase issue 972
            firebase.auth().currentUser?.reload().then(_ => {
                props.history.push((props.history.location.state as {from: {pathname: string}}).from.pathname);
            });
        });
    }

    return (
        <div className='login-board'>
            <Input
                className='login-board__input'
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

export default LoginBoard;