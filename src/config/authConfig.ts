import defaultTo from 'lodash/defaultTo';
import toBoolean from '../util/toBoolean';

export const authConfig = Object.freeze({
    // Anonymous settings
    enableAnonymousIdentity: toBoolean(defaultTo(process.env.REACT_APP_ENABLE_ANONYMOUS_IDENTITY, true)),

    // Mainstream auth providers
    enableGoogleIdentity: toBoolean(defaultTo(process.env.REACT_APP_ENABLE_GOOGLE_IDENTITY, true)),
    enableAppleIdentity: toBoolean(defaultTo(process.env.REACT_APP_ENABLE_APPLE_IDENTITY, true)),
    enableMicrosoftIdentity: toBoolean(defaultTo(process.env.REACT_APP_ENABLE_MICROSOFT_IDENTITY, true)),
    enableGithubIdentity: toBoolean(defaultTo(process.env.REACT_APP_ENABLE_GITHUB_IDENTITY, true)),

    // SAML SSO provider for organizations and custom setups
    enableSamlIdentity: toBoolean(defaultTo(process.env.REACT_APP_ENABLE_SAML_IDENTITY, false)),
    samlProviderId: defaultTo(process.env.REACT_APP_SAML_PROVIDER_ID, 'saml.sso'),
    samlProviderName: process.env.REACT_APP_SAML_PROVIDER_NAME
});

export default authConfig;
