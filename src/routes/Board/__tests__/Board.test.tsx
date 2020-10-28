import * as React from 'react';
import Board, {BoardProps} from '../Board';
import {render} from '@testing-library/react';
import {useFirestoreConnect, isLoaded, isEmpty} from 'react-redux-firebase';
import {useSelector} from 'react-redux';

jest.mock('react-redux-firebase');
jest.mock('react-redux');


describe('Board', () => {

    const mockProps: BoardProps = {
        match: {
            params: {id: '-foobar'},
            isExact: true,
            path: '/board/:id',
            url: '/board/-foobar'
        },
        location: null as any,
        history: null as any
    };

    describe('should render correctly', () => {

        const mockBoard = {
            topic: 'Hello World',
            owner: 'Admin',
            date: {
                toDate: () => 'date xyz'
            }
        };

        (useFirestoreConnect as jest.Mock).mockImplementation();
        (useSelector as jest.Mock).mockImplementation();

        test('on isLoaded == false', () => {
            (isLoaded as unknown as jest.Mock).mockReturnValueOnce(false);
            const {container} = render(<Board {...mockProps}/>);
            expect(container.firstChild).toMatchSnapshot();
        });

        test('on isLoaded == true and isEmpty == true', () => {
            (isLoaded as unknown as jest.Mock).mockReturnValueOnce(true);
            (isEmpty as unknown as jest.Mock).mockReturnValueOnce(true);
            const {container} = render(<Board {...mockProps}/>);
            expect(container.firstChild).toMatchSnapshot();
        });

        test('on isLoaded == true and isEmpty == false', () => {
            (isLoaded as unknown as jest.Mock).mockReturnValueOnce(true);
            (isEmpty as unknown as jest.Mock).mockReturnValueOnce(false);
            (useSelector as jest.Mock).mockImplementation().mockReturnValueOnce(mockBoard);
            const {container} = render(<Board {...mockProps}/>);
            expect(container.firstChild).toMatchSnapshot();
        });

    });

    test('should call useFirestoreConnect with correct queriesConfig', () => {
        const mockQueriesConfig = [{collection: 'boards', doc: '-foobar'}];
        const useFirestoreConnectMock = (useFirestoreConnect as jest.Mock).mockImplementation();
        (useSelector as jest.Mock).mockImplementation();
        render(<Board {...mockProps}/>);
        expect(useFirestoreConnectMock).toBeCalledWith(mockQueriesConfig);
    });



});