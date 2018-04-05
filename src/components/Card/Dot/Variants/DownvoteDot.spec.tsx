import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { DownvoteDot, DownvoteDotProps } from './DownvoteDot';
import Dot from '../Dot';

describe('<DownvoteDot />', () => {
  let wrapper: ShallowWrapper<DownvoteDotProps, {}>;
  let onClick: () => void;

  beforeEach(() => {
    onClick = jest.fn();
  });

  it('should match expected structure', () => {
    wrapper = shallow(<DownvoteDot onClick={onClick} />);
    expect(wrapper.debug()).toMatchSnapshot();
  });

  it('should contain <Icon/> when no children are set', () => {
    wrapper = shallow(<DownvoteDot onClick={onClick} />);
    // Icon is mocked by 'mockConstructor'
    expect(wrapper.find('mockConstructor')).toHaveLength(1);
  });

  it('should contain number of votes when children are set', () => {
    wrapper = shallow(<DownvoteDot onClick={onClick}>21</DownvoteDot>);
    expect(
      wrapper
        .find(Dot)
        .childAt(0)
        .text()
    ).toEqual('21');
  });
});
