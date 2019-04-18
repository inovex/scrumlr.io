import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Modal, ModalProps } from './Modal';

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
        expect(shallowWrapper.debug()).toMatchSnapshot();
      });

      it('should call onStatus on mount', () => {
        expect(props.onStatus).toHaveBeenCalled();
      });

      it('should call onSubmit on click on OK button', () => {
        expect(props.onSubmit).not.toHaveBeenCalled();
        shallowWrapper.find('.modal__ack-button').simulate('click');
        expect(props.onSubmit).toHaveBeenCalled();
      });
    });
  });
});
