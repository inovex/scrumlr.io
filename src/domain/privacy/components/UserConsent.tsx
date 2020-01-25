import React, { useState } from 'react';
import './UserConsent.scss';
import PrivacyPreferencesDialog from './PrivacyPreferencesDialog';
import Cookies from 'js-cookie';
import { PRIVACY_PREFERENCES_COOKIE_NAME, setPrivacyPreferences } from '../privacyPreferences';
import Button from '../../../view/basic/components/Button';

export interface UserConsentProps {}
export interface UserConsentState {
    showAdvancedConfiguration: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
}

const ACCEPT_BUTTON_TEXT = 'Accept services';

const UserConsent: React.FC<UserConsentProps> = () => {
    const [state, setState] = useState<UserConsentState>({
        showAdvancedConfiguration: false,
        enableAnalytics: true,
        enableErrorReporting: true
    });

    let privacyPreferences = Cookies.getJSON(PRIVACY_PREFERENCES_COOKIE_NAME);
    if (!!privacyPreferences) {
        setPrivacyPreferences(privacyPreferences.useAnalytics, privacyPreferences.useErrorReporting);
        return null;
    }

    return (
        <div className="UserConsent">
            <div className="UserConsent__basic">
                <div>
                    We use <a href="https://analytics.google.com/">Google Analytics</a> to analyze our traffic and users behaviour and <a href="https://sentry.io">Sentry</a> for
                    application monitoring and error tracking. By clicking "{ACCEPT_BUTTON_TEXT}" or exiting this banner you accept to the use of these services. You can change
                    your preferences anytime in the settings.
                </div>
                <div className="UserConsent__actions">
                    <Button color="primary" onClick={() => setPrivacyPreferences(true, true)} variant="contained">
                        {ACCEPT_BUTTON_TEXT}
                    </Button>
                    <Button onClick={() => setState({ ...state, showAdvancedConfiguration: !state.showAdvancedConfiguration })}>Advanced configuration</Button>
                </div>
            </div>
            <PrivacyPreferencesDialog
                open={state.showAdvancedConfiguration}
                handleClose={() => {
                    setState({ ...state, showAdvancedConfiguration: false });
                }}
            />
        </div>
    );
};

export default UserConsent;
