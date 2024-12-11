import { Box, BoxProps, Grid } from '@chakra-ui/react'
import styles from './iframe.module.scss'

interface IIframeProps extends BoxProps {
  src?: string
}

const Iframe = (props: IIframeProps) => {
  const { src, ...rest } = props

  return (
    <Box padding={0} margin={0} position="relative" width="100%" height={{ base: '212px', md: '400px' }} {...rest}>
      <Grid
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        position="absolute"
        boxSize="border-box"
        width="100% "
        height="100%"
      >
        <iframe
          id={`iframe-${src}-${Math.random().toString(36).substr(2, 9)}`}
          title={`iframe-${src}-${Math.random().toString(36).substr(2, 9)}`}
          src={src}
          allowFullScreen
          loading="lazy"
          allow="autoplay"
          className={styles.iframe}
        />
      </Grid>
    </Box>
  )
}

export default Iframe
