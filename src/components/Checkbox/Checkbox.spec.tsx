import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Checkbox, CheckboxProps } from './Checkbox';

describe('<Column />', () => {
  let wrapper: ShallowWrapper<CheckboxProps, {}>;
  let props: CheckboxProps;

  beforeEach(() => {
    props = {
      label: 'Test'
    };
    wrapper = shallow(<Checkbox {...props} />);
  });

  it('should match the expected structure', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
