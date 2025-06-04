import { chakra, CloseButton } from '@chakra-ui/react'

export const ThumbnailCloseButton = chakra(CloseButton, {
  baseStyle: () => ({
    position: 'absolute',
    right: 1,
    top: 1,
    color: 'white',
    background: 'blackAlpha.500',
    borderRadius: '50%',
    border: 'none',
    _hover: {
      background: 'blackAlpha.700'
    },
    _focus: {
      boxShadow: 'none'
    }
  })
})
