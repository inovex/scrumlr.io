import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('./components/Icon');
jest.mock('./components/Icon/Icon');
jest.mock('./components/Header/subcomponents/Logo');
jest.mock('./components/Header/subcomponents/Logo/Logo');
