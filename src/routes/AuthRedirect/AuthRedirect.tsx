import queryString from "query-string"
import {useEffect} from "react";
import {API} from "../../api";

function AuthRedirect() {
    useEffect(() => {
        const url = location.search;
        const params = queryString.parse(url);

        if (params.code) {
            API.verifyGoogleSignIn(params.code as string);
        }
    }, [])

    return (
        <div>Test</div>
    );
}

export default AuthRedirect;