import { extendTheme } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'
import { CustomButton } from './button.theme'
import colors from './colors.theme'
import { breakPointValues } from './globalStyles'
import { CustomInput } from './input.theme'

const breakpoints = createBreakpoints(breakPointValues)

const theme = extendTheme({
  colors,
  breakpoints,
  components: {
    CloseButton: {
      sizes: {
        xl: {
          width: 12,
          height: 12
        }
      }
    },
    Text: {
      baseStyle: {
        marginBottom: 0
      }
    },
    Button: CustomButton,
    Input: CustomInput,
    // INFO: Fix modal content not full height on iOS safari
    // More detail:https://github.com/chakra-ui/chakra-ui/issues/4680
    Modal: {
      baseStyle: {
        dialogContainer: {
          '@supports(height: -webkit-fill-available)': {},
          zIndex: 10000
        },
        overlay: {
          zIndex: 10000
        }
      }
    },
    Tooltip: {
      baseStyle: {
        zIndex: 10001,
        shouldWrapChildren: true
      }
    },
    Checkbox: {
      baseStyle: {
        control: {
          _checked: {
            background: 'primary.500',
            borderColor: 'primary.500'
          },
          _indeterminate: {
            background: 'primary.500',
            borderColor: 'primary.500'
          }
        }
      }
    }
  },
  // TODO: Add focus border color later
  // shadows: {
  //   outline: `0 0 0 3px ${focusBorderColorPrimary}`
  // },
  styles: {
    global: {
      'html, body': {
        background: 'white'
      },
      body: {
        fontFamily: 'Roboto',
        fontSize: '0.9rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: '#6c757d'
      }
    }
  },
  fonts: {
    heading: 'Roboto',
    body: 'Roboto',
    mono: 'Roboto'
  }
})

export default theme
