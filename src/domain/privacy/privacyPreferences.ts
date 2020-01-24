import { analytics } from '../firebase';
import Cookies from 'js-cookie';

export const PRIVACY_PREFERENCES_COOKIE_NAME = 'privacy_preferences';
export const setPrivacyPreferences = (useAnalytics: boolean, useErrorReporting: boolean) => {
    analytics.setAnalyticsCollectionEnabled(useAnalytics);
    Cookies.set(PRIVACY_PREFERENCES_COOKIE_NAME, { useAnalytics, useErrorReporting });
};
