import { init, withScope, captureException } from '@sentry/browser';
import errorReportingConfig from '../config/errorReportingConfig';

export interface ErrorReporter {
    reportError: (error: any, id: string) => void;
}

class SentryReporter implements ErrorReporter {
    constructor() {
        init({ dsn: errorReportingConfig.sentryDSN });
    }

    reportError(error: any, id: string) {
        withScope((scope) => {
            scope.setTag('context', id);
            captureException(error);
        });
    }
}

class ConsoleReporter implements ErrorReporter {
    reportError(error: any, id: string) {
        console.error(error, { context: id });
    }
}

class StubRepoter implements ErrorReporter {
    reportError(error: any, id: string) {
        // do nothing
    }
}

export const errorReporter = errorReportingConfig.sentryDSN!! ? new SentryReporter() : process.env.NODE_ENV === 'development' ? new ConsoleReporter() : new StubRepoter();
export default errorReporter;
