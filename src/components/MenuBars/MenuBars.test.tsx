import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import Parse from 'parse';
import MenuBars from './MenuBars';

const mockStore = configureStore();

const createMenuBars = (state) => {
    const store = mockStore(state)

    return (
        <Provider store={store}>
            <MenuBars />
        </Provider>
    );
};

describe('Menu', () => {
    beforeEach(() => {
        const mockCurrentUser = jest.fn(() => ({id: 'testId'}));
        Parse.User.current = mockCurrentUser;
    });

    test('should render both add- and settings-menu for moderators', () => {
        const state = {
            users: {
                admins: [{id: 'testId'}]
            }
        };
        const {container} = render(createMenuBars(state));
        expect(container.firstChild).toMatchSnapshot();
    });

    test('should only render add-menu for participants', () => {
        const state = {
            users: {
                admins: []
            }
        };
        const {container} = render(createMenuBars(state));
        expect(container.firstChild).toMatchSnapshot();
    })
})