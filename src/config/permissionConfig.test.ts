describe('permissionConfig', () => {
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
        delete process.env.REACT_APP_ALLOW_ANONYMOUS_BOARDS;

        return import('./permissionConfig').then((imported) => {
            const permissionConfig = imported.default;
            expect(permissionConfig.allowAnonymousBoards).toEqual(true);
        });
    });

    describe('test env parameters', () => {
        test('value is set to false', () => {
            // reset values
            Object.assign(process.env, {
                REACT_APP_ALLOW_ANONYMOUS_BOARDS: 'no'
            });

            return import('./permissionConfig').then((imported) => {
                const permissionConfig = imported.default;
                expect(permissionConfig.allowAnonymousBoards).toEqual(false);
            });
        });

        test('value is set to true', () => {
            // reset values
            Object.assign(process.env, {
                REACT_APP_ALLOW_ANONYMOUS_BOARDS: 'yes'
            });

            return import('./permissionConfig').then((imported) => {
                const permissionConfig = imported.default;
                expect(permissionConfig.allowAnonymousBoards).toEqual(true);
            });
        });
    });
});
