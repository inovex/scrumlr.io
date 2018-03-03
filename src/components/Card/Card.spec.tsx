import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

// import { mapStateToProps } from './Card.container';
import { mockCard } from '../../builder';
import { Card, CardProps, CardState } from './Card';
import Details from './Details';
import Footer from './Footer';

describe('<Card />', () => {
  describe('mapStateToProps', () => {});

  describe('dumb component', () => {
    let props: CardProps;
    let shallowWrapper: ShallowWrapper<CardProps, {}>;

    beforeEach(() => {
      props = {
        boardId: 'boardId',

        card: mockCard(),
        votable: false,
        showVotes: false,

        id: 'cardId',
        author: { name: 'author' },
        column: 'positive',
        votes: 0,
        owner: false,
        editable: false,
        deletable: false,
        isFocusable: false,
        isAdmin: false,
        isFocused: false,
        onRemove: jest.fn(),
        onDownvote: jest.fn(),
        onUpvote: jest.fn(),
        onUpdateText: jest.fn(),
        onShowVotes: jest.fn(),
        onFocus: jest.fn(),
        onCardStack: jest.fn(),
        onCardStackReversed: jest.fn(),
        onColumnStack: jest.fn(),
        stacked: false,
        getCardsInTheStack: jest.fn(() => []),
        ownVotes: 0
      };
    });

    describe('rendering', () => {
      it('should pipe result through connectDropTarget and connectDragSource methods', () => {
        const identityFn = (el: any) => el;
        const connectDropTargetSpy = jest.fn(identityFn);
        const connectDragSourceSpy = jest.fn(identityFn);
        shallowWrapper = shallow(
          <Card
            {...props}
            connectDragSource={connectDragSourceSpy}
            connectDropTarget={connectDropTargetSpy}
          />
        );
        expect(connectDragSourceSpy).toHaveBeenCalled();
        expect(connectDropTargetSpy).toHaveBeenCalled();
      });
    });

    describe('ownership', () => {
      it('should add necessary css classes if user owns card', () => {
        shallowWrapper = shallow(<Card {...props} owner={true} />);
        const target = shallowWrapper.find('.card-indicator');
        expect(target.prop('className')).toContain('card-indicator--own');
        expect(target.prop('className')).not.toContain('card-indicator--other');
      });
      it('should add necessary css classes if user does not own card', () => {
        shallowWrapper = shallow(<Card {...props} owner={false} />);
        const target = shallowWrapper.find('.card-indicator');
        expect(target.prop('className')).not.toContain('card-indicator--own');
        expect(target.prop('className')).toContain('card-indicator--other');
      });
    });

    describe('voting', () => {
      it('should show votes if card is votable', () => {
        shallowWrapper = shallow(<Card {...props} votable={true} />);
        const footer = shallowWrapper.find(Footer);
        expect(footer.prop('votable')).toEqual(true);
      });

      it('should call onUpdateVoteForCard with correct params when card is downvoted', () => {
        shallowWrapper = shallow(<Card {...props} votable={true} />);
        const footer = shallowWrapper.find(Footer);
        footer.prop('onDownvote')();
        expect(props.onDownvote).toHaveBeenCalledWith(props.id);
      });

      it('should call onUpdateVoteForCard with correct params when card is upvoted', () => {
        shallowWrapper = shallow(<Card {...props} votable={true} />);
        const footer = shallowWrapper.find(Footer);
        footer.prop('onUpvote')();
        expect(props.onUpvote).toHaveBeenCalledWith(props.id);
      });
    });

    describe('expand behaviour', () => {
      it('should show card as collapsed by default', () => {
        shallowWrapper = shallow(<Card {...props} />);
        expect((shallowWrapper.instance().state as CardState).expanded).toBe(
          false
        );
      });

      it('should toggle expanded state when card is expanded', () => {
        shallowWrapper = shallow(<Card {...props} />);
        const instance: any = shallowWrapper.instance();
        instance.expand();
        expect((instance.state as CardState).expanded).toBe(true);
        expect(shallowWrapper.find(Details)).toHaveLength(1);
      });

      it('should toggle expand state then expanded card is closed', () => {
        // Prepare state of card instance
        shallowWrapper = shallow(<Card {...props} />);
        const instance: any = shallowWrapper.instance();
        instance.setState((state: CardState): CardState => ({
          ...state,
          expanded: true
        }));

        // Check that correct method is passed to Details component
        expect(shallowWrapper.find(Details).prop('onClose')).toEqual(
          instance.onDetailsCloseListener
        );
        // Call listener and check if state is correcty toggled
        instance.onDetailsCloseListener();
        expect((instance.state as CardState).expanded).toBe(false);
        expect(shallowWrapper.find(Details)).toHaveLength(0);
      });
    });

    describe('select behaviour', () => {
      it('should not be isFocusable if isFocusable is false', () => {
        shallowWrapper = shallow(<Card {...props} isFocusable={false} />);
        const buttonBar = shallowWrapper.find('.card__admin-buttonbar');
        expect(buttonBar.find('button[aria-label="Select card"]')).toHaveLength(
          0
        );
      });

      it('should be isFocusable if isFocusable is true', () => {
        shallowWrapper = shallow(<Card {...props} isFocusable={true} />);
        const buttonBar = shallowWrapper.find('.card__admin-buttonbar');
        const selectCardBtn = buttonBar.find(
          'button[aria-label="Select card"]'
        );
        expect(selectCardBtn).toHaveLength(1);
        selectCardBtn.simulate('click');
        expect(props.onFocus).toHaveBeenCalledWith(props.id);
      });
    });

    describe('text overflow', async () => {
      it('should have an indicator for text overflow', () => {
        shallowWrapper = shallow(<Card {...props} />);
        const instance: any = shallowWrapper.instance();
        instance.contentHasOverflowingContent = jest.fn(() => true);
        instance.forceUpdate();
        expect(
          shallowWrapper.find('.card__more-content-indicator')
        ).toHaveLength(1);
      });
    });

    describe('stacked cards', () => {
      it('should add div for stack visualization if stack is availbale', () => {
        shallowWrapper = shallow(
          <Card {...props} getCardsInTheStack={() => [mockCard()]} />
        );
        expect(shallowWrapper.find('.card__in-stack')).toHaveLength(1);
      });
    });
  });
});
