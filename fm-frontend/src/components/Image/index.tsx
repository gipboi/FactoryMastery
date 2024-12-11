import { useEffect, useState } from 'react'

interface IImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string
}

const DEFAULT_IMAGE: string = '/assets/images/default.png'

const Image = ({ containerClassName, src = '', alt, onError, ...props }: IImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>(src || DEFAULT_IMAGE)

  function handleError(evt: React.SyntheticEvent<HTMLImageElement, Event>): void {
    if (onError) {
      onError(evt)
    } else {
      setImageUrl('/assets/images/default.png')
    }
  }

  useEffect(() => {
    if (src) {
      setImageUrl(src)
    }
  }, [src])

  return (
    <div className={containerClassName}>
      <img src={imageUrl} alt={alt} onError={handleError} {...props} />
    </div>
  )
}

export default Image
