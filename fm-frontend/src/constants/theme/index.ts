export enum EZIndexLayer {
  BASE = 0,
  UPPER = 1,
  INPUT_DROPDOWN = 1000,
  OVER_INPUT_DROPDOWN = 1001,
  CONTENT_VIEW = 1100,
  WELCOME_BAR = 1150,
  FILTER_BAR = 1200,
  NAV = 1300,
  OVER_CONTENT = 1150,
  // INFO: Follow z-index of chakra modal component
  // https://chakra-ui.com/docs/components/modal
  MODAL = 1400,
  OVERLAY = 1500,
  TOAST = 9999
}

export enum EBreakPoint {
  BASE = 'base',
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl'
}
