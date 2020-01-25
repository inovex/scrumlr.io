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

class ErrorReporterAdapter implements ErrorReporter {
    private reporter: ErrorReporter;
    private defaultRepoter: ErrorReporter;

    constructor() {
        if (process.env.NODE_ENV === 'development') {
            this.defaultRepoter = new ConsoleReporter();
        } else {
            this.defaultRepoter = new StubRepoter();
        }
        this.reporter = this.defaultRepoter;
    }

    reportError(error: any, id: string) {
        this.reporter.reportError(error, id);
    }

    enableReportingService(enable: boolean) {
        if (enable && !!errorReportingConfig.sentryDSN) {
            this.reporter = new SentryReporter();
        } else {
            this.reporter = this.defaultRepoter;
        }
    }
}

export const errorReporter = new ErrorReporterAdapter();
export default errorReporter;
