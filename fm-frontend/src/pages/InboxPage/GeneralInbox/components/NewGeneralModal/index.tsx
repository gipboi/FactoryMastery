import {
  Button,
  FormControl,
  FormLabel,
  HStack,
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
import { useStores } from 'hooks/useStores';
import { useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleUploadMultiple } from 'utils/upload';
import UserAndGroupDropdown from '../UserAndGroupDropdown';
import SvgIcon from 'components/SvgIcon';
import { checkValidArray, getValidArray } from 'utils/common';
import AttachmentSection from 'components/AttachmentSection';
import {
  collection,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  query,
} from 'firebase/firestore';
import { db } from 'config/firebase';
import { IUserWithRelations } from 'interfaces/user';
import { getName } from 'utils/user';
import { EInboxTab } from 'pages/SupportInboxPage/constants';
import routes from 'routes';

interface INewGeneralMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient?: IUserWithRelations;
}

const NewGeneralMessageModal = (props: INewGeneralMessageModalProps) => {
  const navigate = useNavigate();
  const { isOpen, onClose, recipient } = props;
  const { organizationStore, authStore, messageStore, groupStore } =
    useStores();
  const { userDetail } = authStore;
  const { groups } = groupStore;
  const { organization } = organizationStore;
  const organizationId = organization?.id ?? '';
  const currentTheme = organization?.theme ?? {};

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const limit: number = Number(params.get('limit')) || 20;

  const fileInputRef = useRef<any>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const methods = useForm<any>();
  const { handleSubmit, register, reset } = methods;

  async function handleUpload(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      const targetFiles = Array.from(evt.currentTarget.files);
      setAttachments([...attachments, ...targetFiles]);
    }
  }

  async function onSubmit(data: any) {
    try {
      setIsLoading(true);
      const listMemberIds: string[] = [userDetail?.id!];
      let { subject, comment } = data;
      const attachmentData = await handleUploadMultiple(
        attachments,
        organizationId ?? ''
      );

      if (!!subject?.isGroup) {
        const groupMembers = getValidArray(groups).find(
          (group) => group?.id === subject?.value
        )?.groupMembers;
        if (groupMembers) {
          listMemberIds.push(
            ...getValidArray(groupMembers)
              .map((groupMember) => groupMember?.userId ?? '')
              .filter(Boolean)
          );
        }
      } else if (!recipient) {
        listMemberIds.push(subject.value);
      } else {
        subject = {
          ...subject,
          label: getName(recipient),
          value: recipient?.id ?? recipient?._id ?? '',
        };
        listMemberIds.push(subject.value);
      }

      let groupMessageThreadRef;
      const querySnapshot = await getDocs(
        query(
          collection(db, 'groupMessageThreads'),
          where('memberId', 'array-contains', listMemberIds[0])
        )
      );
      const filteredResults = querySnapshot.docs.filter((doc) => {
        const members = doc.data().memberId || [];
        return (
          members?.length === 2 &&
          listMemberIds.every((id) => members.includes(id))
        );
      });

      if (!filteredResults?.length) {
        groupMessageThreadRef = await addDoc(
          collection(db, 'groupMessageThreads'),
          {
            name: subject?.label,
            organizationId,
            isPrivate: true,
            createdAt: serverTimestamp(),
            memberId: listMemberIds,
            isGroup: !!subject?.isGroup,
          }
        );
      } else {
        groupMessageThreadRef = filteredResults?.[0];
      }

      const docRef = await addDoc(collection(db, 'messages'), {
        groupMessageThreadId: groupMessageThreadRef.id,
        userId: userDetail?.id,
        receiverId: subject.value,
        organizationId,
        content: comment,
        attachments: attachmentData,
        createdAt: serverTimestamp(),
        seenBy: [],
      });

      messageStore.setCurrentGeneralThreadId(
        groupMessageThreadRef.id,
        docRef.id,
        userDetail?.id!
      );

      const currentPath = window.location.pathname;
      const messageRoute = `${routes.messages.value}?tab=${EInboxTab.GENERAL}`
      if (currentPath) {
        navigate(messageRoute);
      }
    } catch (error) {
      console.error('error', error);
    } finally {
      setIsLoading(false);
      onClose();
      reset({});
    }
  }

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
              New General Message
            </ModalHeader>
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody borderY="1px solid #E2E8F0" padding={6}>
              <VStack width="full" align="flex-start" spacing={6}>
                {!recipient && <UserAndGroupDropdown />}
                <FormControl>
                  <FormLabel marginBottom={2} color="gray.700">
                    Message
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
                  <AttachmentSection
                    attachments={attachments}
                    setAttachments={setAttachments}
                    fileInputRef={fileInputRef}
                    isLoading={isLoading}
                  />
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

export default NewGeneralMessageModal;
