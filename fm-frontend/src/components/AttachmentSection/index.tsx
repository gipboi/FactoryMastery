import { useStores } from 'hooks/useStores';
import { ITheme } from 'interfaces/theme';
import {
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Image,
  Input,
  Tag,
  VStack,
} from '@chakra-ui/react';
import { S3FileTypeEnum } from 'constants/aws';
import MediaThumbnailWithIcon from 'components/MediaThumbnail/components/MediaThumbnailWithIcon';
import { getThumbnailType } from 'pages/InboxPage/GeneralInbox/components/GeneralDetail/utils';
import { IAttachment } from 'interfaces/message';
import { checkValidArray, getValidArray } from 'utils/common';
import { ThumbnailCloseButton } from 'pages/SupportInboxPage/InboxDetail/inboxDetail.styles';
import SvgIcon from 'components/SvgIcon';

interface IAttachmentSectionProps {
  attachments: File[];
  setAttachments: (value: React.SetStateAction<File[]>) => void;
  fileInputRef: any;
  isLoading: boolean;
}

const AttachmentSection = ({
  attachments,
  setAttachments,
  fileInputRef,
  isLoading,
}: IAttachmentSectionProps) => {
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  return (
    <VStack
      width="full"
      align="flex-start"
      spacing={0}
    >
      {checkValidArray(attachments) && (
        <HStack
          width="full"
          align="flex-start"
          overflowX="auto"
          gap={4}
          spacing={0}
        >
          {getValidArray(attachments).map((attachment, index) => {
            function handleRemove() {
              const temp = [...attachments];
              temp.splice(index, 1);
              setAttachments([...temp]);
            }
            return (
              <Box
                border="1px solid #CBD5E0"
                borderRadius={4}
                position="relative"
              >
                {attachment?.type?.includes(S3FileTypeEnum.IMAGE) ? (
                  <Image
                    width="72px"
                    height="62px"
                    objectFit="contain"
                    borderRadius={4}
                    alt={attachment?.name}
                    src={URL.createObjectURL(attachment)}
                  />
                ) : (
                  <MediaThumbnailWithIcon
                    width="72px"
                    height="62px"
                    borderRadius={4}
                    type={getThumbnailType(attachment?.name)}
                  />
                )}
                <ThumbnailCloseButton size="sm" onClick={handleRemove} />
                <Tag
                  size="sm"
                  color="gray.500"
                  paddingX={1}
                  border="1px solid #E2E8F0"
                  position="absolute"
                  bottom={1}
                  right={1}
                  zIndex={2}
                >
                  {attachment?.type?.includes(S3FileTypeEnum.IMAGE)
                    ? 'Photo'
                    : getThumbnailType(attachment?.name)}
                </Tag>
              </Box>
            );
          })}
        </HStack>
      )}
    </VStack>
  );
};

export default AttachmentSection;
