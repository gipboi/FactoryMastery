export const CustomInput = {
  variants: {
    outline: {
      field: {
        background: 'inherit',
        border: '1px solid',
        borderColor: 'inherit',
        // _focus: {
        //   borderColor: 'teal.500',
        //   borderWidth: 2,
        //   boxShadow: '0 0 0 2px teal.500'
        // },
        _invalid: {
          borderColor: 'red.500',
          borderWidth: 2,
          boxShadow: '0 0 0 2px red.500'
        },
        _hover: { borderColor: 'gray.300' }
      }
    },
    filled: {
      field: {
        background: 'gray.100',
        border: '1px solid',
        borderColor: 'transparent',
        _focus: {
          background: 'transparent',
          borderWidth: 2,
          borderColor: 'teal.500'
        },
        _invalid: {
          borderColor: 'red.500',
          borderWidth: 2,
          boxShadow: '0 0 0 2px red.500'
        },
        _hover: {
          background: 'gray.300'
        }
      }
    },
    flushed: {
      field: {
        background: 'transparent',
        borderBottom: '1px solid',
        borderColor: 'inherit',
        borderRadius: 0,
        paddingX: 0,
        _focus: {
          borderColor: 'teal.500',
          borderWidth: 2,
          boxShadow: '0 0 0 2px teal.500'
        },
        _invalid: {
          borderColor: 'red.500',
          borderWidth: 2,
          boxShadow: '0 0 0 2px red.500'
        }
      }
    },
    unstyled: {
      field: {
        background: 'transparent',
        borderRadius: 'md',
        height: 'auto',
        paddingX: 0
      }
    }
  },
  defaultProps: {
    size: 'md',
    variant: 'outline'
  }
}
