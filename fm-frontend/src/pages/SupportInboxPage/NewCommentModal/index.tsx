/* eslint-disable max-lines */
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { createSupportMessageThreads } from 'API/messages/support-message';
import AttachmentSection from 'components/AttachmentSection';
import SvgIcon from 'components/SvgIcon';
import { useStores } from 'hooks/useStores';
import { ITheme } from 'interfaces/theme';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { checkValidArray } from 'utils/common';
import { handleUploadMultiple } from 'utils/upload';

interface INewCommentForm {
  subject: string;
  comment: string;
}

interface INewCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchThreadList: () => void;
}

const NewCommentModal = (props: INewCommentModalProps) => {
  const { isOpen, onClose, fetchThreadList } = props;
  const { authStore, messageStore, organizationStore } = useStores();
  const { userDetail } = authStore;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const organizationId: string = userDetail?.organizationId ?? '';
  const fileInputRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const methods = useForm<INewCommentForm>();
  const { handleSubmit, register, reset } = methods;

  async function handleUpload(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      const targetFiles = Array.from(evt.currentTarget.files);
      setAttachments([...attachments, ...targetFiles]);
    }
  }

  async function onSubmit(form: INewCommentForm): Promise<void> {
    if (form?.subject && form?.comment) {
      try {
        setIsLoading(true);
        const attachmentData = await handleUploadMultiple(
          attachments,
          organizationId
        );
        const newComment = {
          organizationId,
          userId: userDetail?.id ?? '',
          subject: form?.subject,
          content: form?.comment,
          attachments: attachmentData,
        };
        const newThread = await createSupportMessageThreads(newComment);
        await fetchThreadList();
        messageStore.setCurrentSupportThreadId(newThread?.id);
        await messageStore.getSupportMessages();
        onClose();
        toast.success('Add new comment successfully');
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      reset();
      setAttachments([]);
    }
  }, [isOpen, organizationId]);

  return (
    <Modal isCentered size="xl" isOpen={isOpen} onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent borderRadius={8}>
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              New Comment
            </ModalHeader>
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody borderY="1px solid #E2E8F0" padding={6}>
              <VStack width="full" align="flex-start" spacing={6}>
                <FormControl>
                  <FormLabel color="gray.700">Subject</FormLabel>
                  <Input
                    {...register('subject')}
                    placeholder="Enter subject to leave comment"
                    autoComplete="off"
                    required
                  />
                </FormControl>
                <FormControl>
                  <FormLabel marginBottom={2} color="gray.700">
                    Comment
                  </FormLabel>
                  <Textarea
                    {...register('comment')}
                    placeholder="Enter your comment"
                    required
                  />
                </FormControl>
                <Button
                  variant="outline"
                  color="gray.700"
                  background="white"
                  fontWeight={500}
                  lineHeight={6}
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={
                    <SvgIcon iconName="ic_baseline-attach-file" size={16} />
                  }
                >
                  Attach file
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                  multiple
                />
                {checkValidArray(attachments) && (
                  <HStack
                    width="full"
                    align="flex-start"
                    wrap="wrap"
                    gap={4}
                    spacing={0}
                  >
                    {checkValidArray(attachments) && (
                      <AttachmentSection
                        attachments={attachments}
                        setAttachments={setAttachments}
                        fileInputRef={fileInputRef}
                        isLoading={isLoading}
                      />
                    )}
                  </HStack>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack width="full" justify="flex-end">
                <HStack spacing={4}>
                  <Button
                    variant="outline"
                    color="gray.700"
                    background="white"
                    fontWeight={500}
                    lineHeight={6}
                    onClick={onClose}
                    isLoading={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    fontWeight={500}
                    lineHeight={6}
                    color="white"
                    background={currentTheme?.primaryColor ?? 'primary.500'}
                    _hover={{
                      background: currentTheme?.primaryColor ?? 'primary.700',
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
                    _active={{
                      background: currentTheme?.primaryColor ?? 'primary.700',
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
                    isLoading={isLoading}
                  >
                    Send
                  </Button>
                </HStack>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default observer(NewCommentModal);
