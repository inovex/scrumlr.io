import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { AddDot, DownvoteDot } from '../Dot';

import { UserVotes, UserVotesProps } from './UserVotes';

describe('<UserVotes />', () => {
  let wrapper: ShallowWrapper<UserVotesProps, {}>;
  let props: UserVotesProps = {
    votes: 0,
    onDownvote: jest.fn(),
    onUpvote: jest.fn()
  };

  it('should have default values', () => {
    expect(UserVotes.defaultProps).toMatchSnapshot();
  });

  it('should as many dots as votes are available', () => {
    wrapper = shallow(<UserVotes {...props} votes={0} />);
    let dots = wrapper.find(DownvoteDot);
    expect(dots).toHaveLength(0);

    wrapper = shallow(<UserVotes {...props} votes={3} />);
    dots = wrapper.find(DownvoteDot);
    expect(dots).toHaveLength(1);
  });

  it('should render only one dot if more votes are available than maximal allowed dots', () => {
    const votes = 5;
    wrapper = shallow(<UserVotes {...props} votes={votes} />);
    const dots = wrapper.find(DownvoteDot);
    expect(dots).toHaveLength(1);
    expect(dots.prop('children')).toEqual(votes);
  });

  it('should call onDownvote callback if a DownvoteDot is clicked', () => {
    wrapper = shallow(<UserVotes {...props} votes={1} />);
    const dots = wrapper.find(DownvoteDot);
    expect(props.onDownvote).not.toHaveBeenCalled();
    dots.at(0).simulate('click');
    expect(props.onDownvote).toHaveBeenCalled();
  });

  it('should render an AddDot component', () => {
    wrapper = shallow(<UserVotes {...props} />);
    const addDot = wrapper.find(AddDot);
    expect(addDot).toHaveLength(1);
  });

  it('should call onUpvote callback if the AddDot component is clicked', () => {
    wrapper = shallow(<UserVotes {...props} />);
    const addDot = wrapper.find(AddDot);
    expect(props.onUpvote).not.toHaveBeenCalled();
    addDot.at(0).simulate('click');
    expect(props.onUpvote).toHaveBeenCalled();
  });
});
