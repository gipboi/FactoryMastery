import React, { useRef } from 'react'
import { MdEdit as EditIcon } from 'react-icons/md'
import cx from 'classnames'
import Button from 'components/Button'
import Image from 'components/Image'
import SvgIcon from 'components/SvgIcon'
import styles from './styles.module.scss'

interface IUploadImageProps {
  value?: string
  file?: File
  isEditable: boolean
  setFile?: (file: File | undefined) => void
  classNameImage?: string
  className?: string
  hasUploadButton?: boolean
}

function UploadImage(props: IUploadImageProps) {
  const { value, setFile, isEditable, classNameImage, className, file, hasUploadButton } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUploadLocalImage = file ? URL.createObjectURL(file) : ''

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && setFile) {
      // setFile(URL.createObjectURL(event.target.files[0]) ?? '')
      setFile(event.target.files[0])
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        className={styles.imageInput}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      <div className={styles.editContainer}>
        <Image
          src={previewUploadLocalImage || value}
          className={cx(styles.selectedImage, classNameImage)}
          alt="Selected"
        />
        {isEditable && !hasUploadButton && (
          <div className={cx(styles.editIconContainer, classNameImage)}>
            <Button className={styles.buttonIcon} onClick={() => fileInputRef?.current?.click()}>
              <EditIcon />
            </Button>
          </div>
        )}
      </div>
      {hasUploadButton && (
        <Button
          marginTop="8px"
          background="white"
          variant="outline"
          fontSize="16px"
          lineHeight="24px"
          fontWeight={500}
          color="gray.700"
          _hover={{
            background: 'gray.100'
          }}
          _active={{
            background: 'gray.200'
          }}
          gap={2}
          width="full"
          onClick={() => fileInputRef?.current?.click()}
        >
          <SvgIcon iconName="file-upload" size={16} />
          Change image
        </Button>
      )}
    </div>
  )
}

export default UploadImage
