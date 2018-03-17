import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Column, ColumnProps } from './Column';

describe('<Column />', () => {
  let wrapper: ShallowWrapper<ColumnProps, {}>;
  let props: ColumnProps;

  beforeEach(() => {
    props = {
      boardUrl: 'test',
      cards: [],
      column: {
        name: 'Column',
        voting: {
          enabled: false
        }
      },

      title: 'Column 1',
      type: 'positive',
      active: true,
      theme: 'foo',

      hasNextColumn: false,
      hasPreviousColumn: false,
      onGoToNextColumn: jest.fn(),
      onGoToPrevColumn: jest.fn()
    } as any;
  });

  describe('css classes', () => {
    it('should add a class depending on the theme', () => {
      const theme = 'my-theme';
      wrapper = shallow(<Column {...props} theme={theme} />);
      expect(wrapper.prop('className')).toContain(`column--theme-${theme}`);
    });

    it('should add a class if column is inactive', () => {
      wrapper = shallow(<Column {...props} isActive={false} />);
      expect(wrapper.prop('className')).toContain(`column--inactive`);
    });
  });
});
