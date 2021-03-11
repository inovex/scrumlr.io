import React from 'react'
import {act, render, fireEvent} from "@testing-library/react";
import BoardHeader from "./BoardHeader";

const createBoardHeader = (name, boardstatus) => {
    return (
        <BoardHeader name={name} boardstatus={boardstatus}/>
    )
};

describe('basic', () => {

    beforeEach(() => {
        window.IntersectionObserver = jest.fn(() => ({
            observe: jest.fn(),
            disconnect: jest.fn()
        }) as any);
    });

    test('show boardheader', () => {
        const { container } = render(createBoardHeader("Title", "Private Session"));
        expect(container.firstChild).toHaveClass("board-header");
    });

    describe('show board-header-components', () => {

        test('show board-header__logo', () => {
            const { container } = render(createBoardHeader("Title", "Private Session"));
            expect(container.querySelector(".board-header").firstChild).toHaveClass("board-header__logo");
        });

        test('show board-header__infos', () => {
            const { container } = render(createBoardHeader("Title", "Private Session"));
            expect(container.querySelector(".board-header").childNodes[1]).toHaveClass("board-header__infos");
        });

        test('show board-header__users', () => {
            const { container } = render(createBoardHeader("Title", "Private Session"));
            expect(container.querySelector(".board-header").childNodes[2]).toHaveClass("board-header__users");
        });
    });

    describe('show title and boardstatus', () => {

        test('show title', () => {
            const { container } = render(createBoardHeader("Title", "Private Session"));
            expect(container.querySelector(".board-header__title")).toHaveTextContent("Title");
        });

        test('show boardstatus private', () => {
            const { container } = render(createBoardHeader("Title", "Private Session"));
            expect(container.querySelector(".board-header__status")).toHaveTextContent("Private Session");
        });

        test('show boardstatus public', () => {
            const { container } = render(createBoardHeader("Title", "Public Session"));
            expect(container.querySelector(".board-header__status")).toHaveTextContent("Public Session");
        });
    });
});