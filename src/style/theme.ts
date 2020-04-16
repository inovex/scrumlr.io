import { createMuiTheme } from '@material-ui/core';
import { blue, lime } from '@material-ui/core/colors';

export const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: lime,
  },
  typography: {
    fontFamily: ['Heebo', '-apple-system', '"Helvetica Neue"', 'sans-serif'].join(','),
  },
  overrides: {
    MuiCheckbox: {
      // override settings
    },
  },
  props: {
    MuiButton: {
      variant: 'outlined',
      color: 'primary',
    },
    MuiCheckbox: {
      color: 'primary',
    },
  },
});

export default theme;
