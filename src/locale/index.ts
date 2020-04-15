import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const initLocale = () => {
    i18n.use(initReactI18next) // passes i18n down to react-i18next
        .init({
            resources: {
                en: {
                    advancedBoardSetup: {
                        heading: 'Advanced board setup options',
                        helper: 'Before you start your first session you can set some settings',
                        admissionControl: {
                            heading: 'Admission control',
                            helper: 'Admission control helper text'
                        },
                        encryptData: {
                            heading: 'Encrypt data',
                            helper: 'Encrypt data helper text'
                        }
                    },
                    votingConfiguration: {
                        voteLimit: 'Enable vote limit',
                        allowMultivote: 'Allow multivote',
                        showVotes: 'Show votes',
                        controls: {
                            start: 'Start voting',
                            stop: 'Complete voting',
                            reset: 'Reset voting'
                        }
                    },
                    templates: {
                        heading: 'Create new board',
                        createBoard: 'Create board',
                        featuredTemplates: 'Featured templates',
                        otherTemplates: 'Other templates',
                        myTemplates: 'My templates'
                    }
                }
            },
            lng: 'en',
            fallbackLng: 'en',

            interpolation: {
                escapeValue: false
            }
        });
};

export default initLocale;
