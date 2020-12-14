import * as React from 'react';
import {render} from '@testing-library/react';
import LoadingScreen from '../LoadingScreen';

test('render loading screen without info text', () => {
    const {container} = render(<LoadingScreen/>);
    expect(container.firstChild).toMatchSnapshot();
});

test('render loading screen with info text', () => {
    const {container} = render(<LoadingScreen info='Test'/>);
    expect(container.firstChild).toMatchSnapshot();
});