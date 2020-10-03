import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { PhaseMenu, PhaseMenuProps } from './PhaseMenu';
import retroModes from '../../constants/mode';

describe('<PhaseMenu />', () => {
  let wrapper: ShallowWrapper<PhaseMenuProps, {}>;
  let props: PhaseMenuProps;

  beforeEach(() => {
    props = {
      admin: false,
      phasesConfig: retroModes['positiveNegative'],
      guidedPhase: 0,
      onPrevPhase: jest.fn(),
      onNextPhase: jest.fn()
    };
  });

  it('should not allow to jump to previous phase if guided phase index is 0', () => {
    wrapper = shallow(<PhaseMenu {...props} admin={true} guidedPhase={0} />);
    const prevBtn = wrapper.find('[aria-label="Go to previous phase"]');
    expect(prevBtn).toHaveLength(1);
    expect(prevBtn.prop('disabled')).toEqual(true);
  });

  it('should allow to jump to previous phase if guided phase index is greater than 0', () => {
    wrapper = shallow(<PhaseMenu {...props} admin={true} guidedPhase={1} />);
    const prevBtn = wrapper.find('[aria-label="Go to previous phase"]');
    expect(prevBtn).toHaveLength(1);
    expect(prevBtn.prop('disabled')).toEqual(false);
    expect(props.onPrevPhase).not.toHaveBeenCalled();
    prevBtn.simulate('click');
    expect(props.onPrevPhase).toHaveBeenCalled();
  });

  it('should allow to jump to previous phase if guided phase index is greater than 0', () => {
    wrapper = shallow(
      <PhaseMenu
        {...props}
        admin={true}
        guidedPhase={Object.keys(props.phasesConfig).length - 1}
      />
    );
    const prevBtn = wrapper.find('[aria-label="Go to previous phase"]');
    expect(prevBtn).toHaveLength(1);
    expect(prevBtn.prop('disabled')).toEqual(false);
    expect(props.onPrevPhase).not.toHaveBeenCalled();
    prevBtn.simulate('click');
    expect(props.onPrevPhase).toHaveBeenCalled();
  });

  it('should render current phase index and name', () => {
    const phaseIndex = 0;
    wrapper = shallow(
      <PhaseMenu {...props} admin={true} guidedPhase={phaseIndex} />
    );
    expect(wrapper.text()).toContain(`Phase ${phaseIndex + 1}`);
    expect(wrapper.text()).toContain(props.phasesConfig[phaseIndex].name);
  });
});
