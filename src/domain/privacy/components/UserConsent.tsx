import React, { useState } from 'react';
import './UserConsent.scss';
import PrivacyPreferencesDialog from './PrivacyPreferencesDialog';
import Cookies from 'js-cookie';
import { PRIVACY_PREFERENCES_COOKIE_NAME, setPrivacyPreferences } from '../privacyPreferences';
import Button from '../../../view/basic/components/Button';
import { Link, Snackbar } from '@material-ui/core';

export interface UserConsentProps {}
export interface UserConsentState {
    showAdvancedConfiguration: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
}

const ACCEPT_BUTTON_TEXT = 'Accept';

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

    const message = (
        <>
            We use <Link href="https://analytics.google.com/">Google Analytics</Link> to analyze our traffic and users behaviour and <Link href="https://sentry.io">Sentry</Link>{' '}
            for application monitoring and error tracking. By clicking "{ACCEPT_BUTTON_TEXT}" or exiting this banner you accept to the use of these services. You can change your
            preferences anytime in the settings.
        </>
    );

    const actions = (
        <>
            <Button variant="text" size="small" onClick={() => setState({ ...state, showAdvancedConfiguration: !state.showAdvancedConfiguration })}>
                Advanced configuration
            </Button>
            <Button
                color="primary"
                onClick={() => {
                    setPrivacyPreferences(true, true);
                    setState({ ...state, showAdvancedConfiguration: false });
                }}
                variant="contained"
            >
                {ACCEPT_BUTTON_TEXT}
            </Button>
        </>
    );

    return (
        <>
            <Snackbar open={true} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={message} action={actions} />
            <PrivacyPreferencesDialog
                open={state.showAdvancedConfiguration}
                handleClose={() => {
                    setState({ ...state, showAdvancedConfiguration: false });
                }}
            />
        </>
    );
};

export default UserConsent;
