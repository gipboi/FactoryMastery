import { chakra, Button as CkButton, Text } from '@chakra-ui/react'

export const CollectionName = chakra(Text, {
  baseStyle: () => ({
    color: 'gray.700',
    cursor: 'pointer',
    fontSize: 'md',
    fontWeight: 600,
    lineHeight: 6,
    _hover: {
      cursor: 'pointer',
      color: 'primary.500'
    }
  })
})

export const ProcessName = chakra(Text, {
  baseStyle: () => ({
    color: '#313A46',
    fontSize: 'sm',
    fontWeight: 500,
    lineHeight: 5,
    _hover: {
      cursor: 'pointer',
      color: 'primary.500'
    }
  })
})

export const TextTitle = chakra(Text, {
  baseStyle: () => ({
    minWidth: '168px',
    color: 'gray.700',
    fontSize: 'sm',
    fontWeight: 600,
    lineHeight: 6,
    margin: 0
  })
})

export const Button = chakra(CkButton, {
  baseStyle: () => ({
    minWidth: 0,
    width: 6,
    height: 6,
    padding: 0,
    boxShadow: 'unset',
    border: 'unset',
    background: '#fff',
    _focus: { borderColor: 'unset' },
    _active: { borderColor: 'unset' }
  })
})
