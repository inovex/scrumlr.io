import React, { useEffect, useState } from 'react';
import './UserConsent.scss';
import { analytics } from '../../firebase';
import UserPreferences from './UserPreferences';

export interface UserConsentProps {}
export interface UserConsentState {
    showAdvancedConfiguration: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
}

const ACCEPT_BUTTON_TEXT = 'Accept services';

const setPreferences = (useAnalytics: boolean, useErrorReporting: boolean) => {
    analytics.setAnalyticsCollectionEnabled(useAnalytics);
};

const PreferencesCheck: React.FC<UserConsentProps> = () => {
    const [state, setState] = useState<UserConsentState>({
        showAdvancedConfiguration: false,
        enableAnalytics: true,
        enableErrorReporting: true
    });

    useEffect(() => {}, []);

    return (
        <div className="UserConsent">
            <div className="UserConsent__basic">
                <div>
                    We use <a href="https://analytics.google.com/">Google Analytics</a> to analyze our traffic and users behaviour and <a href="https://sentry.io">Sentry</a> for
                    application monitoring and error tracking. By clicking "{ACCEPT_BUTTON_TEXT}" or exiting this banner you accept to the use of these services. You can change
                    your preferences anytime in the settings.
                </div>
                <div className="UserConsent__actions">
                    <button onClick={() => setPreferences(true, true)}>{ACCEPT_BUTTON_TEXT}</button>
                    <button onClick={() => setState({ ...state, showAdvancedConfiguration: !state.showAdvancedConfiguration })}>Advanced configuration</button>
                </div>
            </div>
            {state.showAdvancedConfiguration && (
                <div className="UserConsent__advanced">
                    <UserPreferences />
                </div>
            )}
        </div>
    );
};

export default PreferencesCheck;
