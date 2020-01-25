// @ts-ignore
describe('authConfig', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    test('default values', () => {
        // reset values
        delete process.env.REACT_APP_ENABLE_ANONYMOUS_IDENTITY;
        delete process.env.REACT_APP_ENABLE_GOOGLE_IDENTITY;
        delete process.env.REACT_APP_ENABLE_APPLE_IDENTITY;
        delete process.env.REACT_APP_ENABLE_MICROSOFT_IDENTITY;
        delete process.env.REACT_APP_ENABLE_GITHUB_IDENTITY;
        delete process.env.REACT_APP_ENABLE_SAML_IDENTITY;
        delete process.env.REACT_APP_SAML_PROVIDER_ID;
        delete process.env.REACT_APP_SAML_PROVIDER_NAME;

        return import('./authConfig').then((imported) => {
            const authConfig = imported.default;
            expect(authConfig.enableAnonymousIdentity).toEqual(true);
            expect(authConfig.enableGoogleIdentity).toEqual(true);
            expect(authConfig.enableAppleIdentity).toEqual(true);
            expect(authConfig.enableMicrosoftIdentity).toEqual(true);
            expect(authConfig.enableGithubIdentity).toEqual(true);
            expect(authConfig.enableSamlIdentity).toEqual(false);
            expect(authConfig.samlProviderId).toEqual('saml.sso');
            expect(authConfig.samlProviderName).toEqual(undefined);
        });
    });
});
