import React from 'react';
import { render, fireEvent } from '@testing-library/react';

interface firebase {
    auth: {
        signInWithRedirect: jest.Mock;
    };
    firebase: {
        auth: {
            OAuthProvider: jest.Mock;
            GithubAuthProvider: jest.Mock;
            GoogleAuthProvider: jest.Mock;
            SAMLAuthProvider: jest.Mock;
        };
    };
}

const withMocks = (testMethod: (SignIn: React.FC, firebase: firebase) => void, config: { authConfig?: any } = {}) => {
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

        const firebase = {
            auth: {
                signInWithRedirect: jest.fn()
            },
            firebase: {
                auth: {
                    OAuthProvider: jest.fn(),
                    GithubAuthProvider: jest.fn(),
                    GoogleAuthProvider: jest.fn(),
                    SAMLAuthProvider: jest.fn()
                }
            }
        };

        jest.doMock('../../firebase', () => firebase);

        const SignIn = require('./SignIn').default;
        testMethod(SignIn, firebase);
    });
};

describe('<SignIn />', () => {
    describe('disabled state of sign in', () => {
        test('all buttons should be enabled', () => {
            withMocks(
                (SignIn) => {
                    const component = render(<SignIn />);
                    expect(component.getByText(/Google/i)).toHaveProperty('disabled', false);
                    expect(component.getByText(/Apple/i)).toHaveProperty('disabled', false);
                    expect(component.getByText(/Microsoft/i)).toHaveProperty('disabled', false);
                    expect(component.getByText(/GitHub/i)).toHaveProperty('disabled', false);
                    expect(component.getByText(/scrumlr.io/i)).toHaveProperty('disabled', false);
                    expect(component.getByText(/anonymous/i)).toHaveProperty('disabled', false);
                },
                {
                    authConfig: {
                        enableAnonymousIdentity: true,
                        enableGoogleIdentity: true,
                        enableAppleIdentity: true,
                        enableMicrosoftIdentity: true,
                        enableGithubIdentity: true,
                        enableSamlIdentity: true,
                        samlProviderId: 'saml.sso',
                        samlProviderName: 'scrumlr.io'
                    }
                }
            );
        });

        test('all buttons should be disabled', () => {
            withMocks(
                async (SignIn, firebase) => {
                    const component = render(<SignIn />);

                    firebase.auth.signInWithRedirect.mockReturnValue(new Promise(() => {}));
                    fireEvent.click(component.getByText(/Google/i));

                    expect(await component.getByText(/Google/i)).toHaveProperty('disabled', true);
                    expect(await component.getByText(/Apple/i)).toHaveProperty('disabled', true);
                    expect(await component.getByText(/Microsoft/i)).toHaveProperty('disabled', true);
                    expect(await component.getByText(/GitHub/i)).toHaveProperty('disabled', true);
                    expect(await component.getByText(/scrumlr.io/i)).toHaveProperty('disabled', true);
                    expect(await component.getByText(/anonymous/i)).toHaveProperty('disabled', true);
                },
                {
                    authConfig: {
                        enableAnonymousIdentity: true,
                        enableGoogleIdentity: true,
                        enableAppleIdentity: true,
                        enableMicrosoftIdentity: true,
                        enableGithubIdentity: true,
                        enableSamlIdentity: true,
                        samlProviderId: 'saml.sso',
                        samlProviderName: 'scrumlr.io'
                    }
                }
            );
        });
    });

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
});
