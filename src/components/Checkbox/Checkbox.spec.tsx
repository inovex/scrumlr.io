import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Checkbox, CheckboxProps } from './Checkbox';

describe('<Column />', () => {
  let wrapper: ShallowWrapper<CheckboxProps, {}>;

  it('should match the expected structure', () => {
    wrapper = shallow(<Checkbox>Some label</Checkbox>);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should pass the children as the label', () => {
    const label = 'My label';
    wrapper = shallow(<Checkbox>{label}</Checkbox>);
    expect(wrapper.find('.checkbox__label').text()).toEqual(label);
  });

  it('should include label wrapper when no children are set', () => {
    wrapper = shallow(<Checkbox />);
    expect(wrapper.find('.checkbox__label').length).toEqual(0);
  });

  it('should hide the control', () => {
    wrapper = shallow(<Checkbox />);
    expect(wrapper.find('.checkbox__control').prop('aria-hidden')).toEqual(
      'true'
    );
  });
});
