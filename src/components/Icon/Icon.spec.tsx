import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { iconSvgNames } from './definitions';

// Jest cannot work with external webpack loaders, so mock all svg imports.
jest.unmock('./Icon');
iconSvgNames.forEach(name => {
  jest.mock(`!svg-inline-loader!../../assets/${name}.svg`, () => 'svg', {
    virtual: true
  });
});
import { Icon, IconProps } from './Icon';

describe('<Icon />', () => {
  let wrapper: ShallowWrapper<IconProps, {}>;
  let props: IconProps = {
    name: 'circle-arrow-left'
  };

  it('should have default props', () => {
    expect(Icon.defaultProps).toMatchSnapshot();
  });

  it('should set width and height of the svg', () => {
    const width = 10;
    const height = 20;
    wrapper = shallow(<Icon {...props} width={width} height={height} />);
    expect(wrapper.prop('style')).toEqual({ width, height });
  });

  it('should be possible to give custom class name', () => {
    const className = 'foobar';
    wrapper = shallow(<Icon {...props} className={className} />);
    expect(wrapper.at(0).prop('className')).toContain(className);
  });

  it('should be possible to add any other property', () => {
    const myCoolProperty = 'foobar';
    wrapper = shallow(
      <Icon {...props} data-my-cool-property={myCoolProperty} />
    );
    expect(wrapper.at(0).prop('data-my-cool-property')).toContain(
      myCoolProperty
    );
  });
});
