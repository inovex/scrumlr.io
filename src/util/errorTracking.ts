import {init, withScope, captureException} from '@sentry/browser';
import sentryDSN from "../config/errorReporting";

export interface ErrorReporter {
    reportError: (error: any, id: string) => void;
}

class SentryReporter implements ErrorReporter {
    constructor() {
        init({dsn: sentryDSN});
    }

    reportError(error: any, id: string){
        withScope((scope) => {
            scope.setTag('context', id);
            captureException(error);
        });
    };
}

class ConsoleReporter implements ErrorReporter {
    reportError(error: any, id: string){
        console.error(error, { context: id });
    };
}

const initErrorReporter = () => {
    if (sentryDSN!!) {
        return new SentryReporter();
    }
    return new ConsoleReporter();
};

export default initErrorReporter();

