import {callAPI} from "./index";

export const AuthAPI = {

    /**
     * Adds a note to a board.
     *
     * @returns `true` if the operation succeeded or throws an error otherwise
     */
    signInWithGoogle: (origin: string) => {
        return callAPI<{ origin: string }, string>('GoogleSignIn', { origin });
    },
}