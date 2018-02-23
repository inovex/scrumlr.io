import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { UserVotes } from '../UserVotes';
import { Dot, DotSize } from '../Dot';
import { Footer, FooterProps } from './Footer';

describe('<Footer />', () => {
  let wrapper: ShallowWrapper<FooterProps, {}>;
  let props: FooterProps;

  beforeEach(() => {
    props = {
      votable: false,
      ownVotes: 0,
      onDownvote: jest.fn(),
      onUpvote: jest.fn(),
      votes: 0
    };
  });

  it('should define default values', () => {
    expect(Footer.defaultProps).toMatchSnapshot();
  });

  it('should pass votes to UserVotes component', () => {
    const ownVotes = 20;
    wrapper = shallow(<Footer {...props} votable={true} ownVotes={ownVotes} />);
    expect(wrapper.find(UserVotes).prop('votes')).toEqual(ownVotes);
  });

  it('should not show votes if they are null', () => {
    wrapper = shallow(<Footer {...props} votes={null} />);
    expect(wrapper.find(Dot)).toHaveLength(0);
  });

  it('should show votes if they are not null', () => {
    const votes = 20;
    wrapper = shallow(<Footer {...props} votes={votes} />);
    expect(wrapper.find(Dot)).toHaveLength(1);
    expect(wrapper.find(Dot).prop('children')).toEqual(votes);
  });

  it('should pass maxDotsShown to UserVotes component', () => {
    const maxDotsShown = 3;
    wrapper = shallow(
      <Footer {...props} votable={true} maxDotsShown={maxDotsShown} />
    );
    expect(wrapper.find(UserVotes).prop('maxDotsShown')).toEqual(maxDotsShown);
  });

  it('should pass onUpvote and onDownvote method to UserVotes', () => {
    wrapper = shallow(<Footer {...props} votable={true} />);
    const userVotes = wrapper.find(UserVotes);
    expect(userVotes.prop('onUpvote')).toBe(props.onUpvote);
    expect(userVotes.prop('onDownvote')).toBe(props.onDownvote);
  });

  it('should pass votes as children to dot component', () => {
    const votes = 10;
    wrapper = shallow(<Footer {...props} votes={votes} />);
    expect(wrapper.find(Dot).prop('children')).toEqual(votes);
  });

  it('should pass the dot size to dot component', () => {
    const dotSize: DotSize = 'small';
    wrapper = shallow(<Footer {...props} dotSize={dotSize} />);
    expect(wrapper.find(Dot).prop('size')).toEqual(dotSize);
  });
});
