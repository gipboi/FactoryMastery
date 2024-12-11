import { Box, BoxProps } from '@chakra-ui/react'
import { Token, Width } from 'types/chakra'
import SvgIcon from 'components/SvgIcon'
import { EMediaThumbnail } from 'constants/media'

interface IMediaThumbnailWithIconProps extends BoxProps {
  type: EMediaThumbnail
  width?: Token<Width | number, 'sizes'>
  height?: Token<Width | number, 'sizes'>
}

const MediaThumbnailWithIcon = (props: IMediaThumbnailWithIconProps) => {
  const { type, width, height, ...rest } = props

  return (
    <Box
      width={width ?? '72px'}
      height={height ?? '72px'}
      background="white"
      display="flex"
      justifyContent="center"
      alignItems="center"
      borderRadius={4}
      {...rest}
    >
      <SvgIcon size={32} iconName={`file-${type.toLocaleLowerCase()}`} />
    </Box>
  )
}

export default MediaThumbnailWithIcon
