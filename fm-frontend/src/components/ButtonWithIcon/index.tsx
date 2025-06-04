import { Button, Text } from '@chakra-ui/react'
import colors from 'themes/colors.theme'

interface IButtonWithIconProps {
  iconChildren: React.ReactNode
  text: string
  onClick: () => void
}

const ButtonWithIcon = (props: IButtonWithIconProps) => {
  const { iconChildren, text, onClick } = props
  return (
    <Button
      padding={{ base: '10px', md: '16px' }}
      backgroundColor="white"
      gap={{ base: 0, md: 2 }}
      border={`1px solid ${colors.gray[200]}`}
      borderRadius="6px"
      variant="solid"
      onClick={onClick}
    >
      {iconChildren}
      <Text
        marginBottom={0}
        fontWeight={500}
        fontSize={{
          base: '0px',
          md: '16px'
        }}
        lineHeight="24px"
        color="gray.700"
      >
        {text}
      </Text>
    </Button>
  )
}

export default ButtonWithIcon
