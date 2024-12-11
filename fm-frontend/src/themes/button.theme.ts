import { background, border } from '@chakra-ui/react'
import { primary, primary500, primary700 } from './globalStyles'

export const CustomButton = {
  baseStyle: {
    border: 'none',
    backgroundColor: primary500,
    color: 'white',
    _focus: {
      boxShadow: 'none'
    },
    _hover: {
      backgroundColor: primary700
    },
  },
  variants: {
    primary: {
      backgroundColor: primary,
      border: 'none',
      color: 'white',
      _hover: {
        backgroundColor: primary700
      },
      _focus: {
        backgroundColor: primary700
      },
      _disabled: {
        opacity: 0.5
      }
    },
    white: {
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: 'gray.200',
      color: 'gray.700',
      _hover: {
        backgroundColor: 'gray.100'
      },
      _focus: {
        backgroundColor: 'gray.100'
      },
      _disabled: {
        opacity: 0.5
      }
    },
    outline: {
      background: 'transparent',
    },
  }
}
