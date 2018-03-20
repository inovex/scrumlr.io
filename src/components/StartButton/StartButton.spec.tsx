import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { StartButton, StartButtonProps, StartButtonState } from './StartButton';
import { DEFAULT_RETRO_MODE } from '../../constants/Retrospective';
import { RetroMode } from '../../constants/mode';

describe('<StartButton />', () => {
  let wrapper: ShallowWrapper<StartButtonProps, StartButtonState>;
  let onStart: any;

  beforeEach(() => {
    onStart = jest.fn();
    wrapper = shallow(<StartButton onStart={onStart} />);
  });

  it('should match expected structure', () => {
    expect(wrapper.debug()).toMatchSnapshot();
  });

  it('should callback with the default retro mode on initial click', () => {
    wrapper.find('.start-button__start').simulate('click');
    expect(onStart).toHaveBeenCalledWith(DEFAULT_RETRO_MODE);
  });

  it('should callback with the expected retro mode when it is changed', () => {
    const expectedRetroMode: RetroMode = 'lean';
    wrapper.setState({ selectedMode: expectedRetroMode });
    wrapper.find('.start-button__start').simulate('click');
    expect(onStart).toHaveBeenCalledWith(expectedRetroMode);
  });

  it('should have a closed selection menu initially', () => {
    expect(wrapper.state().isSelectionMenuOpened).toEqual(false);
  });
});
