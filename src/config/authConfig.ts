const falsy = /^(?:f(?:alse)?|no?|0+)$/i;
const getBoolean = (val: any) => {
    return !falsy.test(val) && !!val;
};

export const authConfig = {
    // Anonymous settings
    enableAnonymousIdentity: process.env.REACT_APP_ENABLE_ANONYMOUS_IDENTITY === undefined || getBoolean(process.env.REACT_APP_ENABLE_ANONYMOUS_IDENTITY),
    allowAnonymousBoards: process.env.REACT_APP_ALLOW_ANONYMOUS_BOARDS === undefined || getBoolean(process.env.REACT_APP_ALLOW_ANONYMOUS_BOARDS),

    // Mainstream auth providers
    enableGoogleIdentity: process.env.REACT_APP_ENABLE_GOOGLE_IDENTITY === undefined || getBoolean(process.env.REACT_APP_ENABLE_GOOGLE_IDENTITY),
    enableAppleIdentity: process.env.REACT_APP_ENABLE_APPLE_IDENTITY === undefined || getBoolean(process.env.REACT_APP_ENABLE_APPLE_IDENTITY),
    enableMicrosoftIdentity: process.env.REACT_APP_ENABLE_MICROSOFT_IDENTITY === undefined || getBoolean(process.env.REACT_APP_ENABLE_MICROSOFT_IDENTITY),
    enableGithubIdentity: process.env.REACT_APP_ENABLE_GITHUB_IDENTITY === undefined || getBoolean(process.env.REACT_APP_ENABLE_GITHUB_IDENTITY),

    // SAML SSO provider for organizations and custom setups
    enableSamlIdentity: process.env.REACT_APP_ENABLE_SAML_IDENTITY === undefined ? false : getBoolean(process.env.REACT_APP_ENABLE_SAML_IDENTITY),
    samlProviderId: process.env.REACT_APP_SAML_PROVIDER_ID === undefined ? 'saml.sso' : process.env.REACT_APP_SAML_PROVIDER_ID
};

export default authConfig;
