import React from 'react'
import {render} from "@testing-library/react";
import Board from "./Board";
import Column from "./Column";

test('show empty board', () => {
    const { container } = render(
        <Board>
        </Board>
    );

    expect(container.firstChild).toHaveClass("board--empty");
});

test('correct number of columns is set in inner styles', () => {
    const { container } = render(
        <Board>
            <Column color="violet" />
            <Column color="pink" />
            <Column color="blue" />
            <Column color="purple" />
        </Board>
    );

    expect(container.querySelector('style')).toHaveTextContent('.board { --board__columns: 4 }');
});

describe('side-panels', () => {
    test('left side-panel is present', () => {
        const { container } = render(
            <Board>
                <Column color="blue" />
                <Column color="pink" />
            </Board>
        );
        expect(container.querySelector(".board").firstChild).toHaveClass("board__spacer-left");
    });

    test('right side-panel is present', () => {
        const { container } = render(
            <Board>
                <Column color="blue" />
                <Column color="pink" />
            </Board>
        );
        expect(container.querySelector(".board").lastChild).toHaveClass("board__spacer-right");
    });

    test('left side-panel has correct accent color', () => {
        const { container } = render(
            <Board>
                <Column color="blue" />
                <Column color="pink" />
            </Board>
        );
        expect(container.querySelector(".board").firstChild).toHaveClass("accent-color__blue");
    });

    test('right side-panel has correct accent color', () => {
        const { container } = render(
            <Board>
                <Column color="blue" />
                <Column color="pink" />
            </Board>
        );
        expect(container.querySelector(".board").lastChild).toHaveClass("accent-color__pink");
    });

    test('side-panels have correct accent color with single column', () => {
        const { container } = render(
            <Board>
                <Column color="violet" />
            </Board>
        );

        const board = container.querySelector(".board");
        expect(board.firstChild).toHaveClass("accent-color__violet");
        expect(board.lastChild).toHaveClass("accent-color__violet");
    });
});

