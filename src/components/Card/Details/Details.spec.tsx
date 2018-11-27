import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Details, DetailsProps } from './Details';
import { mockCard } from '../../../builder';
import { Card } from '../../../types';
import Deferred from '../../Deferred';

describe('<Details />', () => {
  let props: DetailsProps;
  let wrapper: ShallowWrapper<DetailsProps, {}>;
  let content = 'This is content';

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
      onColumnStack: jest.fn(),
      onClose: jest.fn(),
      stacked: false,
      getCardsInTheStack: jest.fn(() => []),
      ownVotes: 0,
      onEditMode: jest.fn()
    };
  });

  it('should render a backdrop that closes the card when clicked', () => {
    wrapper = shallow(<Details {...props}>{content}</Details>);
    const backdropEl = wrapper.find('.card-details__backdrop');
    expect(backdropEl).toHaveLength(1);
    expect(props.onClose).not.toHaveBeenCalled();
    backdropEl.simulate('click');
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  describe('edit mode', () => {
    it('should should show the content as a blockquote if not in edit mode', () => {
      wrapper = shallow(<Details {...props}>{content}</Details>);
      const blockquote = wrapper.find('.card-details__card-text');
      const textarea = wrapper.find('.card-details__content-text--edit-mode');
      expect(blockquote).toHaveLength(1);
      expect(textarea).toHaveLength(0);
      expect(blockquote.text()).toEqual(content);
    });

    xit('should switch to edit mode if blockquote is clicked', () => {
      wrapper = shallow(
        <Details {...props} editable={true}>
          {content}
        </Details>
      );
      const blockquote = wrapper.find('.card-details__card-text');
      expect(wrapper.state('editMode')).toEqual(false);
      blockquote.simulate('click');
      expect(wrapper.state('editMode')).toEqual(true);
    });

    xit('should not switch to edit mode if blockquote is clicked and editable is false', () => {
      wrapper = shallow(
        <Details {...props} editable={false}>
          {content}
        </Details>
      );
      const blockquote = wrapper.find('.card-details__card-text');
      expect(wrapper.state('editMode')).toEqual(false);
      blockquote.simulate('click');
      expect(wrapper.state('editMode')).toEqual(false);
    });

    xit('should show the content within a textarea if edit mode is enabled', () => {
      wrapper = shallow(<Details {...props}>{content}</Details>);
      wrapper.setState({ editMode: true });
      const blockquote = wrapper.find('.card-details__card-text');
      const textarea = wrapper.find('.card-details__content-text--edit-mode');
      expect(blockquote).toHaveLength(0);
      expect(textarea).toHaveLength(1);
      expect(textarea.prop('defaultValue')).toEqual(content);
    });

    xit('should automatically focus the text area', () => {
      wrapper = shallow(<Details {...props}>{content}</Details>);
      wrapper.setState({ editMode: true });
      const textarea = wrapper.find('.card-details__content-text--edit-mode');
      expect(textarea.prop('autoFocus')).toEqual(true);
    });

    xit('should call onUpdateText if element textarea is blurred', () => {
      const text = 'my text';
      wrapper = shallow(<Details {...props}>{content}</Details>);
      wrapper.setState({ editMode: true });
      const textarea = wrapper.find('.card-details__content-text--edit-mode');
      textarea.simulate('focus');
      expect(wrapper.state('editMode')).toEqual(true);
      textarea.simulate('blur', { target: { value: text } });
      expect(wrapper.state('editMode')).toEqual(false);
      expect(props.onUpdateText).toHaveBeenCalledTimes(1);
      expect(props.onUpdateText).toHaveBeenCalledWith(props.id, text);
    });
  });

  describe('deletable', () => {
    it('should not show a delete option if card is not deletable', () => {
      wrapper = shallow(
        <Details {...props} deletable={false}>
          {content}
        </Details>
      );
      const optsContainer = wrapper.find('.card-details__options');
      expect(optsContainer.find('[key="delete"]')).toHaveLength(0);
    });

    it('should show a delete option if card is deletable', () => {
      wrapper = shallow(
        <Details {...props} deletable={true}>
          {content}
        </Details>
      );
      const optsContainer = wrapper.find('.card-details__options');
      expect(
        optsContainer.find('[aria-label="Delete this card"]')
      ).toHaveLength(1);
    });

    it('should call onRemove with correct id if card is removed', () => {
      wrapper = shallow(
        <Details {...props} deletable={true}>
          {content}
        </Details>
      );
      const optsContainer = wrapper.find('.card-details__options');
      const deleteBtn = optsContainer.find('[aria-label="Delete this card"]');
      expect(props.onRemove).not.toHaveBeenCalled();
      deleteBtn.simulate('click');
      expect(props.onRemove).toHaveBeenCalledWith(props.id);
    });
  });

  describe('stack', () => {
    let cards: Card[];

    beforeEach(() => {
      cards = [
        mockCard({ id: 'card1', text: 'text1' }),
        mockCard({ id: 'card2', text: 'text2' })
      ];
    });

    it('should not show a stack if cardsInStack has no elements', () => {
      const spy = jest.fn(() => []);
      wrapper = shallow(
        <Details {...props} getCardsInTheStack={spy}>
          {content}
        </Details>
      );
      const stackCards = wrapper.find('.card-details__stack-item');
      expect(stackCards).toHaveLength(0);
    });

    it('should show a stack if cardsInStack has some elements', () => {
      const spy = jest.fn(() => cards);
      wrapper = shallow(
        <Details {...props} getCardsInTheStack={spy}>
          {content}
        </Details>
      );
      const stackCards = wrapper.find('.card-details__stack-item');
      expect(stackCards).toHaveLength(2);
    });

    it('should render the deferred resolution of all cards', () => {
      const spy = jest.fn(() => cards);
      wrapper = shallow(
        <Details {...props} getCardsInTheStack={spy}>
          {content}
        </Details>
      );

      const stackCards = wrapper.find(Deferred);
      expect(stackCards.length).toEqual(cards.length);
    });

    it('should now allow to delete cards if parent card is not deletable', () => {
      const spy = jest.fn(() => cards);
      wrapper = shallow(
        <Details {...props} getCardsInTheStack={spy} deletable={false}>
          {content}
        </Details>
      );

      const stack = wrapper.find('.card-details__stack');
      const stackCardsOpts = stack.find('.card-details__option');
      expect(stackCardsOpts).toHaveLength(0);
    });

    it('should allow to delete card if parent card is deletable', () => {
      const spy = jest.fn(() => cards);
      wrapper = shallow(
        <Details {...props} getCardsInTheStack={spy} deletable={true}>
          {content}
        </Details>
      );

      const stack = wrapper.find('.card-details__stack');
      const stackCardsOpts = stack.find('.card-details__option');
      expect(stackCardsOpts).toHaveLength(cards.length);
    });

    it('should call onRemove with child card id if card is deleted', () => {
      const spy = jest.fn(() => cards);
      wrapper = shallow(
        <Details {...props} getCardsInTheStack={spy} deletable={true}>
          {content}
        </Details>
      );

      const stack = wrapper.find('.card-details__stack');
      const stackCardsOpts = stack.find('.card-details__option');

      stackCardsOpts.at(0).simulate('click');
      expect(props.onRemove).toHaveBeenCalledWith(cards[0].id);

      stackCardsOpts.at(1).simulate('click');
      expect(props.onRemove).toHaveBeenCalledWith(cards[1].id);
    });
  });
});
