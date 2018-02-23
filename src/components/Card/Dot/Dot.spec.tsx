import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Dot, DotProps, DotSize } from './Dot';

describe('<Dot />', () => {
  let wrapper: ShallowWrapper<DotProps, {}>;
  let props: DotProps = {
    size: 'small'
  };

  it('should have default props', () => {
    expect(Dot.defaultProps).toMatchSnapshot();
  });

  it('should not render a button if onClick is not defined', () => {
    wrapper = shallow(<Dot {...props} />);
    expect(wrapper.find('button')).toHaveLength(0);
  });

  it('should have correct classNames', () => {
    let size: DotSize = 'small';
    wrapper = shallow(<Dot {...props} size={size} />);
    expect(wrapper.at(0).prop('className')).toContain(`dot__${size}`);

    size = 'large';
    wrapper = shallow(<Dot {...props} size={size} />);
    expect(wrapper.at(0).prop('className')).toContain(`dot__${size}`);
  });

  it('should be possible to add custom className', () => {
    let className: string = 'some-super-cool-class';
    wrapper = shallow(<Dot {...props} className={className} />);
    expect(wrapper.at(0).prop('className')).toContain(className);
  });

  it('should render a button if onClick is defined', () => {
    const onClickSpy = jest.fn();
    wrapper = shallow(<Dot {...props} onClick={onClickSpy} />);
    expect(wrapper.find('button')).toHaveLength(1);
  });

  it('should call onClick method if button is clicked', () => {
    const onClickSpy = jest.fn();
    wrapper = shallow(<Dot {...props} onClick={onClickSpy} />);
    const button = wrapper.find('button');
    expect(onClickSpy).not.toHaveBeenCalled();
    button.simulate('click');
    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });

  it('should not render an additional element if animate is false', () => {
    const onClickSpy = jest.fn();
    wrapper = shallow(<Dot {...props} onClick={onClickSpy} animate={false} />);
    expect(wrapper.find('.dot__folded-corner')).toHaveLength(0);
  });

  it('should render an additional element if animate is true', () => {
    const onClickSpy = jest.fn();
    wrapper = shallow(<Dot {...props} onClick={onClickSpy} animate={true} />);
    expect(wrapper.find('.dot__folded-corner')).toHaveLength(1);
  });

  it('should render its children if no onClick method is passed', () => {
    const children = 'Foobar';
    wrapper = shallow(
      <Dot {...props}>
        {children}
      </Dot>
    );
    expect(wrapper.text()).toEqual(children);
  });

  it('should render its children if an onClick method is passed', () => {
    const children = 'Foobar';
    const onClickSpy = jest.fn();
    wrapper = shallow(
      <Dot {...props} onClick={onClickSpy}>
        {children}
      </Dot>
    );
    expect(wrapper.text()).toEqual(children);
  });
});
