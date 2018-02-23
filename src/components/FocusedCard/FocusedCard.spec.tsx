import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { mockCard } from '../../builder';
import { FocusedCard, FocusedCardProps } from './FocusedCard';
import KeyboardNavigationHint from './KeyboardNavigationHint/KeyboardNavigationHint';

describe('<FocusedCard />', () => {
  let wrapper: ShallowWrapper<FocusedCardProps, {}>;
  let props: FocusedCardProps;

  beforeEach(() => {
    props = {
      boardUrl: 'test',
      card: mockCard(),
      isAdmin: false,
      isRootCard: true,
      onClose: jest.fn(),
      setAsRoot: jest.fn(),
      showVotes: false
    };
  });

  it('should render', () => {
    expect(() => <FocusedCard {...props} />).not.toThrow();
  });

  describe('admin view', () => {
    describe('root/non-root card', () => {
      it('should indicate if card is root card', () => {
        wrapper = shallow(
          <FocusedCard {...props} isAdmin={true} isRootCard={true} />
        );
        const indicator = wrapper.find('.focus-card__star-button');
        expect(indicator.prop('disabled')).toEqual(true);
        expect(indicator.find('Icon').prop('name')).toEqual('stack-top');
      });

      it('should indicate if card is not root card', () => {
        wrapper = shallow(
          <FocusedCard {...props} isAdmin={true} isRootCard={false} />
        );
        const indicator = wrapper.find('.focus-card__star-button');
        expect(indicator.prop('disabled')).toEqual(false);
        expect(indicator.find('Icon').prop('name')).toEqual('stack-mid');
      });

      it('should allow to change root card', () => {
        wrapper = shallow(
          <FocusedCard {...props} isAdmin={true} isRootCard={false} />
        );
        const indicator = wrapper.find('.focus-card__star-button');
        expect(props.setAsRoot).not.toHaveBeenCalled();
        indicator.simulate('click');
        expect(props.setAsRoot).toHaveBeenCalled();
      });
    });

    it('should be possible to close focus view', () => {
      wrapper = shallow(<FocusedCard {...props} isAdmin={true} />);
      const el = wrapper.find('.focus-card__close-button');
      expect(props.onClose).not.toHaveBeenCalled();
      el.simulate('click');
      expect(props.onClose).toHaveBeenCalled();
    });

    it('should show a keyboard navigation hint', () => {
      wrapper = shallow(<FocusedCard {...props} isAdmin={true} />);
      const el = wrapper.find(KeyboardNavigationHint);
      expect(el).toHaveLength(1);
    });
  });

  describe('non-admin view', () => {
    it('should add cards text as DotDotDot children', () => {
      wrapper = shallow(<FocusedCard {...props} />);
      const el = wrapper.find('Dotdotdot');
      expect(el.prop('children')).toEqual(props.card.text);
    });

    describe('votes', () => {
      it('should not show votes', () => {
        wrapper = shallow(<FocusedCard {...props} />);
        const el = wrapper.find('.focus-card__number-of-votes');
        expect(el).toHaveLength(0);
      });

      it('should not show votes if flag is set', () => {
        wrapper = shallow(<FocusedCard {...props} showVotes={true} />);
        const el = wrapper.find('.focus-card__number-of-votes');
        expect(el).toHaveLength(1);
        expect(el.text()).toEqual(props.card.votes.toString());
      });
    });
  });
});
