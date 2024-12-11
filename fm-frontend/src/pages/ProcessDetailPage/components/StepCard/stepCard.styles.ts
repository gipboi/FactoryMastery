import { chakra, Box, Button, CloseButton } from '@chakra-ui/react'

export const UploadButton = chakra(Box, {
  baseStyle: () => ({
    gap: 2,
    width: 'max-content',
    height: '32px',
    color: 'gray.600',
    background: 'white',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 5,
    borderRadius: 6,
    paddingX: 3,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #E2E8F0',
    _hover: {
      cursor: 'pointer',
      background: 'gray.200'
    }
  })
})

export const SaveButton = chakra(Button, {
  baseStyle: () => ({
    gap: 2,
    color: 'white',
    background: 'primary.500',
    border: '0',
    fontWeight: 500,
    lineHeight: 5,
    _hover: { background: 'primary.700' }
  })
})

export const OutlineButton = chakra(Button, {
  baseStyle: () => ({
    gap: 2,
    color: 'primary.500',
    background: 'white',
    fontWeight: 500,
    lineHeight: 5,
    border: '1px solid #00A9EB',
    _hover: {
      color: 'white',
      background: 'primary.500',
      svg: {
        filter: 'invert(34%) sepia(0%) saturate(0%) hue-rotate(12deg) brightness(188%) contrast(111%)'
      }
    }
  })
})

export const ThumbnailCloseButton = chakra(CloseButton, {
  baseStyle: () => ({
    position: 'absolute',
    right: 2,
    top: 2,
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
