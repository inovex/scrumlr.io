import React from 'react';
import ScrumlrLogo from "./ScrumlrLogo";
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

test('render default logo', () => {
    const { container } = render(<ScrumlrLogo />)
    expect(container.firstChild).toMatchSnapshot();
})

test('render logo with empty accent color array', () => {
    const { container } = render(<ScrumlrLogo accentColorClassNames={[]} />)
    expect(container.firstChild).toMatchSnapshot();
});

test('render logo with two accent colors', () => {
    const { container } = render(<ScrumlrLogo accentColorClassNames={[ "red", "blue" ]} />)
    expect(container.firstChild).toMatchSnapshot();
});

test('render logo with three accent colors', () => {
    const { container } = render(<ScrumlrLogo accentColorClassNames={[ "red", "blue", "green" ]} />)
    expect(container.firstChild).toMatchSnapshot();
});