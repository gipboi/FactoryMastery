import { chakra, shouldForwardProp } from '@chakra-ui/react'
import { BaseStyle } from 'types/common'

function chakraShouldForwardProp(CkComponent: any, baseStyle: BaseStyle) {
  return chakra(CkComponent, {
    // shouldForwardProp now uses Chakra's built-in logic
    shouldForwardProp: (prop: string) => {
      // Check if it’s a Chakra prop and prevent forwarding it
      const isChakraProp = !shouldForwardProp(prop)
      if (isChakraProp) return false

      // Only forward the `sample` prop explicitly or valid HTML props
      return ['sample'].includes(prop) || shouldForwardProp(prop)
    },
    baseStyle,
  })
}

export default chakraShouldForwardProp
