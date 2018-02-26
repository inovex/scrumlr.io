import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Modal, ModalProps } from './Modal';

jest.mock('!svg-inline-loader!../../assets/icon-48-close.svg', () => 'svg', {
  virtual: true
});

describe('<Modal />', () => {
  describe('dumb component', () => {
    let props: ModalProps;
    let shallowWrapper: ShallowWrapper<ModalProps, {}>;

    beforeEach(() => {
      props = {
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        onStatus: jest.fn(),
        children: 'Test'
      };

      shallowWrapper = shallow(<Modal {...props} />);
    });

    describe('rendering', () => {
      it('should match the snapshot', () => {
        expect(shallowWrapper.html()).toMatchSnapshot();
      });

      it('should call onStatus on mount', () => {
        expect(props.onStatus).toHaveBeenCalled();
      });

      it('should call onClose on click on close icon', () => {
        expect(props.onClose).not.toHaveBeenCalled();
        shallowWrapper.find('.modal__close-button').simulate('click');
        expect(props.onClose).toHaveBeenCalled();
      });

      it('should call onSubmit on click on OK button', () => {
        expect(props.onSubmit).not.toHaveBeenCalled();
        shallowWrapper.find('.modal__ack-button').simulate('click');
        expect(props.onSubmit).toHaveBeenCalled();
      });
    });
  });
});
