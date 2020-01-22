import React from 'react';
import { render } from '@testing-library/react';

const withMocks = (testMethod: (SignIn: React.FC) => void, config: { authConfig?: any } = {}) => {
    jest.isolateModules(() => {
        jest.doMock('../../../config/authConfig', () => ({
            enableAnonymousIdentity: true,

            enableGoogleIdentity: true,
            enableAppleIdentity: true,
            enableMicrosoftIdentity: true,
            enableGithubIdentity: true,
            enableSamlIdentity: false,

            samlProviderId: 'saml.sso',
            samlProviderName: undefined,
            ...config.authConfig
        }));

        const SignIn = require('./SignIn').default;
        testMethod(SignIn);
    });
};

describe('available auth providers', () => {
    describe('disabled', () => {
        test('it should not render google sign in when disabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/Google/i)).not.toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableGoogleIdentity: false
                    }
                }
            );
        });

        test('it should not render apple sign in when disabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/Apple/i)).not.toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableAppleIdentity: false
                    }
                }
            );
        });

        test('it should not render microsoft sign in when disabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/Microsoft/i)).not.toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableMicrosoftIdentity: false
                    }
                }
            );
        });

        test('it should not render github sign in when disabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/GitHub/i)).not.toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableGithubIdentity: false
                    }
                }
            );
        });

        test('it should not render SAML sign in when disabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/scrumlr.io/i)).not.toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableSamlIdentity: false,
                        samlProviderName: 'scrumlr.io'
                    }
                }
            );
        });

        test('it should not render anonymous sign in when disabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/anonymous/i)).not.toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableAnonymousIdentity: false
                    }
                }
            );
        });
    });

    describe('enabled', () => {
        test('it should render google sign in when enabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/Google/i)).toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableGoogleIdentity: true
                    }
                }
            );
        });

        test('it should render apple sign in when enabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/Apple/i)).toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableAppleIdentity: true
                    }
                }
            );
        });

        test('it should render microsoft sign in when enabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/Microsoft/i)).toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableMicrosoftIdentity: true
                    }
                }
            );
        });

        test('it should render github sign in when enabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/GitHub/i)).toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableGithubIdentity: true
                    }
                }
            );
        });

        test('it should render SAML sign in when enabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/scrumlr.io/i)).toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableSamlIdentity: true,
                        samlProviderName: 'scrumlr.io'
                    }
                }
            );
        });

        test('it should render anonymous sign in when enabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.queryByText(/anonymous/i)).toBeInTheDocument();
                },
                {
                    authConfig: {
                        enableAnonymousIdentity: true
                    }
                }
            );
        });
    });
});
