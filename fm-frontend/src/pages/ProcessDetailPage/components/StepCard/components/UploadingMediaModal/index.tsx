import {
  CircularProgress,
  HStack,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text
} from '@chakra-ui/react'
import { getFileType } from 'components/ProcessMediaTab/utils'
import SvgIcon from 'components/SvgIcon'
import { EMediaThumbnail } from 'constants/media'
import { getValidArray } from 'utils/common'

interface IUploadingMediaModalProps {
  isOpen: boolean
  onClose: () => void
  files: File[]
  uploadingFile: number
}

const UploadingMediaModal = (props: IUploadingMediaModalProps) => {
  const { isOpen, onClose, files, uploadingFile } = props

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <ModalContent
        border="1px solid #CBD5E0"
        borderRadius="8px 8px 0px 0px"
        margin="0"
        position="absolute"
        bottom="0"
        right="3"
      >
        <ModalHeader color="gray.800" fontSize="18px" fontWeight={500} lineHeight={7}>
          Uploading {files?.length} media
        </ModalHeader>
        <ModalCloseButton
          onClick={onClose}
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: 'unset' }}
          _active={{ borderColor: 'unset' }}
        />
        <ModalBody borderTop="1px solid" borderColor="gray.200">
          {getValidArray(files).map((file: File, index: number) => (
            <HStack height="12" justify="space-between">
              <HStack marginLeft={getFileType(file) === EMediaThumbnail.PDF ? 1 : 0} spacing={4}>
                <SvgIcon size={32} iconName={`file-${getFileType(file) ?? 'thumbnail'}`} />
                <Text margin={0}>{file?.name}</Text>
              </HStack>
              {uploadingFile > index ? (
                <SvgIcon size={20} iconName="circle-check-green" />
              ) : (
                <CircularProgress isIndeterminate size={5} color="green.500" />
              )}
            </HStack>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default UploadingMediaModal
