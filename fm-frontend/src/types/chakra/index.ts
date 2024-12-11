export interface ThemeTypings extends EmptyThemeTypings {}

export interface EmptyThemeTypings {
  borders: string
  colors: string
  breakpoints: string
  colorSchemes: string
  fonts: string
  fontSizes: string
  fontWeights: string
  layerStyles: string
  letterSpacings: string
  lineHeights: string
  radii: string
  shadows: string
  sizes: string
  space: string
  textStyles: string
  zIndices: string
  components: {
    [componentName: string]: {
      sizes: string
      variants: string
    }
  }
}
export type Globals = '-moz-initial' | 'inherit' | 'initial' | 'revert' | 'unset'
export type MinWidth<TLength = (string & {}) | 0> =
  | Globals
  | TLength
  | '-moz-fit-content'
  | '-moz-max-content'
  | '-moz-min-content'
  | ''
  | '-webkit-fit-content'
  | '-webkit-max-content'
  | '-webkit-min-content'
  | 'auto'
  | 'fit-content'
  | 'intrinsic'
  | 'max-content'
  | 'min-content'
  | 'min-intrinsic'
  | (string & {})

export type Width<TLength = (string & {}) | 0> =
  | Globals
  | TLength
  | '-moz-fit-content'
  | '-moz-max-content'
  | '-moz-min-content'
  | '-webkit-fit-content'
  | '-webkit-max-content'
  | 'auto'
  | 'fit-content'
  | 'intrinsic'
  | 'max-content'
  | 'min-content'
  | 'min-intrinsic'
  | (string & {})

export type ResponsiveArray<T> = Array<T | null>

export type ResponsiveObject<T> = Partial<Record<ThemeTypings['breakpoints'] | string, T>>

export type ResponsiveValue<T> = T | ResponsiveArray<T> | ResponsiveObject<T>

export type Length = string | 0 | number

export type Union<T> = T | (string & {})

export type Token<CSSType, ThemeKey = unknown> = ThemeKey extends keyof ThemeTypings
  ? ResponsiveValue<Union<CSSType | ThemeTypings[ThemeKey]>>
  : ResponsiveValue<CSSType>
