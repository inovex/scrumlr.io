import React from 'react'
import {act, render, fireEvent} from "@testing-library/react";
import Column from "../Column";

const createColumn = () => {
    return (
        <Column color= 'pink'>
            Testheader
        </Column>
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
            expect(container.firstChild).toHaveTextContent('Testheader');
        });
    });


    describe('should have correct style', () => {

        test('show column with correct style', () => {
            const { container } = render(createColumn());            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});