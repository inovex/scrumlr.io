import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import LoadingScreen, {
  LoadingScreenProps
} from '../../components/LoadingScreen/LoadingScreen';

describe('<LoadingScreen />', () => {
  let wrapper: ShallowWrapper<LoadingScreenProps>;

  it('should render loading screen without status', () => {
    wrapper = shallow(<LoadingScreen />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render loading screen with status', () => {
    wrapper = shallow(<LoadingScreen status="Test status message" />);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
