import React from 'react'
import {render} from "@testing-library/react";
import Column from "../Column";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

const mockStore = configureStore();

const createColumn = () => {
    const initialState = {
        board: {
            data: {
                columns: [{"id":"GG0fWzyCwd","name":"Positive","hidden":false},{"id":"RN1VQn6StI","name":"Negative","hidden":false},{"id":"YwPiaNxejW","name":"Actions","hidden":true}],
            },
        },
        notes: [],
        users: {
          admins: [],
          basic: [],
          all: [],
        },
    };
    const store = mockStore(initialState);
    return (
        <Provider store={store}>
            <Column color= 'pink' columnId='GG0fWzyCwd'/>
        </Provider>
    )
};

describe('Column', () => {
    describe('should render correctly', () => {

        test('show column with correct accent-color', () => {
            const { container } = render(createColumn());
            expect(container.firstChild).toHaveClass("column accent-color__pink");
        });

        test('show header', () => {
            const { container } = render(createColumn());
            expect(container.firstChild).toHaveTextContent('Positive');
        });
    });

    describe('should have correct style', () => {

        test('show column with correct style', () => {
            const { container } = render(createColumn());            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});