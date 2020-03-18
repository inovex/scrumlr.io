import { IconNames } from './types';

export const iconMap: { [key: string]: string } = {
  'circle-arrow-left': 'icon-32-arrow-left',
  'circle-arrow-right': 'icon-32-arrow-right',
  'circle-add': 'icon-32-add',
  circle: 'icon-32-circle',
  more: 'icon-32-more',
  plus: 'icon-14-plus',
  minus: 'icon-14-minus',
  check: 'icon-14-check',
  'circle-selection': 'icon-44-selection-circle',
  'circle-selection-grey': 'icon-44-selection-circle-grey',
  logout: 'icon-20-logout',
  download: 'icon-20-download',
  edit: 'icon-20-create',
  share: 'icon-20-share',
  pencil: 'icon-20-edit',
  focus: 'icon-20-fix',
  feedback: 'icon-20-feedback',
  trash: 'icon-20-trash',
  timer: 'icon-20-timer',
  close: 'icon-32-close',
  close20: 'icon-20-close',
  'close-circle': 'icon-48-close',
  'chevron-left': 'icon-48-chevron-left',
  'chevron-right': 'icon-48-chevron-right',
  overview: 'icon-32-overview',
  'key-down': 'icon-32-key-down',
  'key-up': 'icon-32-key-up',
  'key-esc': 'icon-32-key-esc',
  settings: 'icon-20-settings',
  board: 'icon-20-board',
  'arrow-left': 'icon-32-arrow-left-alt',
  'arrow-right': 'icon-32-arrow-right-alt',
  'phase1-create': 'phase1-01-create',
  'phase1-communicate': 'phase1-02-communicate',
  'phase1-combine': 'phase1-03-combine',
  'phase2-vote': 'phase2-01-vote',
  'phase3-discuss': 'phase3-01-discuss',
  'phase3-define': 'phase3-02-define',
  'stack-top': 'icon-20-stack-active',
  'stack-mid': 'icon-20-stack-enabled',
  'stack-hover': 'icon-20-stack-hover',
  inovex: 'inovex'
};

export const iconNames = Object.keys(iconMap) as IconNames[];
export const iconSvgNames = Object.keys(iconMap).map(
  key => iconMap[key]
) as string[];
