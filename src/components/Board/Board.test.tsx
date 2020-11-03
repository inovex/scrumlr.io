import React from 'react'
import {act, render, fireEvent} from "@testing-library/react";
import Board from "./Board";
import Column from "../Column/Column";

describe('basic', () => {
    beforeAll(() => {
        window.IntersectionObserver = jest.fn(() => ({
            observe: jest.fn(),
            disconnect: jest.fn()
        }) as any);
    });

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
            // @ts-ignore
            expect(container.querySelector(".board").firstChild).toHaveClass("board__spacer-left");
        });

        test('right side-panel is present', () => {
            const { container } = render(
                <Board>
                    <Column color="blue" />
                    <Column color="pink" />
                </Board>
            );
            // @ts-ignore
            expect(container.querySelector(".board").lastChild).toHaveClass("board__spacer-right");
        });

        test('left side-panel has correct accent color', () => {
            const { container } = render(
                <Board>
                    <Column color="blue" />
                    <Column color="pink" />
                </Board>
            );
            // @ts-ignore
            expect(container.querySelector(".board").firstChild).toHaveClass("accent-color__blue");
        });

        test('right side-panel has correct accent color', () => {
            const { container } = render(
                <Board>
                    <Column color="blue" />
                    <Column color="pink" />
                </Board>
            );
            // @ts-ignore
            expect(container.querySelector(".board").lastChild).toHaveClass("accent-color__pink");
        });

        test('side-panels have correct accent color with single column', () => {
            const { container } = render(
                <Board>
                    <Column color="violet" />
                </Board>
            );

            const board = container.querySelector(".board");
            // @ts-ignore
            expect(board.firstChild).toHaveClass("accent-color__violet");
            // @ts-ignore
            expect(board.lastChild).toHaveClass("accent-color__violet");
        });
    });
});

describe('navigation', () => {

    let intersectionObserver: any;

    beforeEach(() => {
        intersectionObserver = {
            observe: jest.fn(),
            disconnect: jest.fn()
        };
        window.IntersectionObserver = jest.fn(() => (intersectionObserver));
    })

    test('intersection observer is registered on mount', () => {
        render(
            <Board>
                <Column color="violet" />
                <Column color="blue" />
            </Board>
        );

        expect(window.IntersectionObserver).toHaveBeenCalled();
        expect(intersectionObserver.observe).toHaveBeenCalledTimes(2);
    });

    test('intersection observer is disconnected on unmount', () => {
        render(
            <Board>
                <Column color="pink" />
            </Board>
        ).unmount();

        expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(1);
    });

    test('navigation is hidden when all columns are visible', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: true, target: columns[0] },
                { isIntersecting: true, target: columns[1] },
                { isIntersecting: true, target: columns[2] }
                ]);
        });

        expect(container.querySelector('.board__navigation')).not.toBeInTheDocument();
    });

    test('navigation is shown when some columns are outside of the viewport', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: false, target: columns[0] },
                { isIntersecting: true, target: columns[1] },
                { isIntersecting: false, target: columns[2] }
            ]);
        });

        expect(container.querySelector('.board__navigation')).toBeInTheDocument();
    });

    test('correct scroll of previous button', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: false, target: columns[0] },
                { isIntersecting: true, target: columns[1] },
                { isIntersecting: false, target: columns[2] }
            ]);
        });

        const scrollIntoView = jest.fn();
        columns[0].scrollIntoView = scrollIntoView;
        fireEvent.click(container.querySelector(".board__navigation-prev") as any);

        expect(scrollIntoView).toHaveBeenCalled();
    });

    test('correct scroll of next button', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: false, target: columns[0] },
                { isIntersecting: true, target: columns[1] },
                { isIntersecting: false, target: columns[2] }
            ]);
        });

        const scrollIntoView = jest.fn();
        columns[2].scrollIntoView = scrollIntoView;
        fireEvent.click(container.querySelector(".board__navigation-next") as any);

        expect(scrollIntoView).toHaveBeenCalled();
    });

    test('infinite loop from end-to-start', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: false, target: columns[0] },
                { isIntersecting: false, target: columns[1] },
                { isIntersecting: true, target: columns[2] }
            ]);
        });

        const scrollIntoView = jest.fn();
        columns[0].scrollIntoView = scrollIntoView;
        fireEvent.click(container.querySelector(".board__navigation-next") as any);

        expect(scrollIntoView).toHaveBeenCalled();
    });

    test('infinite loop from start-to-end', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: true, target: columns[0] },
                { isIntersecting: false, target: columns[1] },
                { isIntersecting: false, target: columns[2] }
            ]);
        });

        const scrollIntoView = jest.fn();
        columns[2].scrollIntoView = scrollIntoView;
        fireEvent.click(container.querySelector(".board__navigation-prev") as any);

        expect(scrollIntoView).toHaveBeenCalled();
    });

    test('previous button has color of previous column', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: false, target: columns[0] },
                { isIntersecting: true, target: columns[1] },
                { isIntersecting: false, target: columns[2] }
            ]);
        });

        expect(container.querySelector('.board__navigation-prev')).toHaveClass('accent-color__pink');
    });

    test('next button has color of next column', () => {
        const { container } = render(
            <Board>
                <Column color="pink" />
                <Column color="blue" />
                <Column color="purple" />
            </Board>
        );

        const columns = container.querySelectorAll('.column');
        act(() => {
            const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[0][0];
            intersectionObserverCallback([
                { isIntersecting: false, target: columns[0] },
                { isIntersecting: true, target: columns[1] },
                { isIntersecting: false, target: columns[2] }
            ]);
        });

        expect(container.querySelector('.board__navigation-next')).toHaveClass('accent-color__purple');
    });
});

