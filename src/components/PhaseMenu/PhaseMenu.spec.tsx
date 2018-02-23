import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { PhaseMenu, PhaseMenuProps } from './PhaseMenu';
import {
  getPhaseConfiguration,
  RETRO_PHASES_MAX_INDEX
} from '../../constants/Retrospective';

describe('<PhaseMenu />', () => {
  let wrapper: ShallowWrapper<PhaseMenuProps, {}>;
  let props: PhaseMenuProps = {
    admin: false,
    guidedPhase: 0,
    onPrevPhase: jest.fn(),
    onNextPhase: jest.fn()
  };

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

  it('should not allow to jump to next phase if guided phase index equal to or larger than RETRO_PHASES_MAX_INDEX', () => {
    wrapper = shallow(
      <PhaseMenu {...props} admin={true} guidedPhase={RETRO_PHASES_MAX_INDEX} />
    );
    const prevBtn = wrapper.find('[aria-label="Go to next phase"]');
    expect(prevBtn).toHaveLength(1);
    expect(prevBtn.prop('disabled')).toEqual(true);
  });

  it('should allow to jump to previous phase if guided phase index is greater than 0', () => {
    wrapper = shallow(
      <PhaseMenu
        {...props}
        admin={true}
        guidedPhase={RETRO_PHASES_MAX_INDEX - 1}
      />
    );
    const prevBtn = wrapper.find('[aria-label="Go to next phase"]');
    expect(prevBtn).toHaveLength(1);
    expect(prevBtn.prop('disabled')).toEqual(false);
    expect(props.onNextPhase).not.toHaveBeenCalled();
    prevBtn.simulate('click');
    expect(props.onNextPhase).toHaveBeenCalled();
  });

  it('should render current phase index and name', () => {
    const phaseIndex = 0;
    wrapper = shallow(
      <PhaseMenu {...props} admin={true} guidedPhase={phaseIndex} />
    );
    expect(wrapper.text()).toContain(`Phase ${phaseIndex + 1}`);
    expect(wrapper.text()).toContain(getPhaseConfiguration(phaseIndex).name);
  });
});
