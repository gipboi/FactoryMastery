import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { EBreakPoint } from 'constants/theme';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { ITheme } from 'interfaces/theme';
import { observer } from 'mobx-react';
import FilterInput from 'pages/CollectionsPage/components/FilterModal/components/FilterInput';
import { ECollectionFilterName } from 'pages/CollectionsPage/components/FilterModal/contants';
import { filterSubmitItems } from 'pages/CollectionsPage/components/FilterModal/utils';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from 'routes';
import colors from 'themes/colors.theme';
import { IOption } from 'types/common';
import { getValidArray } from 'utils/common';
import { IProcessesFilterForm } from './constants';

interface IFilterProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterProcessModal = (props: IFilterProcessModalProps) => {
  const { isOpen, onClose } = props;
  const navigate = useNavigate();
  const location = useLocation();
  let params = new URLSearchParams(location.search);
  const {
    userStore,
    processStore,
    organizationStore,
    documentTypeStore,
    tagStore,
    collectionStore,
  } = useStores();
  const { organization } = organizationStore;
  const { collection } = collectionStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<
    IOption<string>[]
  >([]);
  const [selectedTags, setSelectedTags] = useState<IOption<string>[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IOption<string>[]>([]);

  const methods = useForm<IProcessesFilterForm>();
  const { handleSubmit } = methods;

  function clearFilter(): void {
    setSelectedUsers([]);
    setSelectedDocumentTypes([]);
    setSelectedTags([]);
    navigate(routes.collections.collectionId.value(`${collection?.id}`));
  }

  function onSubmit() {
    const selectedUsersIds = selectedUsers.map((item) => item.value);
    const selectedDocumentTypesIds = selectedDocumentTypes.map(
      (item) => item.value
    );
    const selectedTagsIds = selectedTags.map((item) => item.value);
    params.set(
      ECollectionFilterName.PROCESS_DOCUMENT_TYPES,
      filterSubmitItems(selectedDocumentTypes)
    );
    params.set(
      ECollectionFilterName.PROCESS_TAGS,
      filterSubmitItems(selectedTags)
    );
    params.set(ECollectionFilterName.USERS, filterSubmitItems(selectedUsers));
    processStore.search(
      '',
      0,
      organization?.id,
      selectedDocumentTypesIds,
      selectedTagsIds,
      selectedUsersIds
    );
    navigate(
      `${routes.collections.collectionId.value(
        `${collection?.id}`
      )}?${params.toString()}`
    );
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent minWidth={isMobile ? 'auto' : '800px'} borderRadius={8}>
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              Filter and Sorting Settings
            </ModalHeader>
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody borderTop={`1px solid ${colors.gray[200]}`} padding={6}>
              <HStack width="full" alignItems="flex-start">
                <VStack width="full" alignItems="flex-start" spacing={6}>
                  <FilterInput
                    isOpenModal={isOpen}
                    name={ECollectionFilterName.USERS}
                    label="Created By"
                    placeholder="Search collections by owners"
                    storeOptions={getValidArray(userStore.users)}
                    selectedOptions={selectedUsers}
                    setSelectedOptions={(value) => setSelectedUsers(value)}
                  />
                  <FilterInput
                    isOpenModal={isOpen}
                    name={ECollectionFilterName.PROCESS_DOCUMENT_TYPES}
                    label="Process’s Document Types"
                    placeholder="Search document types"
                    storeOptions={getValidArray(
                      documentTypeStore.documentTypes
                    )}
                    selectedOptions={selectedDocumentTypes}
                    setSelectedOptions={(value) =>
                      setSelectedDocumentTypes(value)
                    }
                  />
                  <FilterInput
                    isOpenModal={isOpen}
                    name={ECollectionFilterName.PROCESS_TAGS}
                    label="Process’s Tag"
                    placeholder="Search tags by label"
                    storeOptions={getValidArray(tagStore.tags)}
                    selectedOptions={selectedTags}
                    setSelectedOptions={(value) => setSelectedTags(value)}
                  />
                </VStack>
              </HStack>
            </ModalBody>
            <ModalFooter>
              <HStack width="full" justify="space-between">
                <Text
                  margin={0}
                  color="gray.700"
                  fontSize="md"
                  fontWeight={500}
                  lineHeight={6}
                  cursor="pointer"
                  onClick={clearFilter}
                >
                  Clear Filters
                </Text>
                <HStack>
                  <Button
                    variant="outline"
                    background="white"
                    fontWeight={500}
                    lineHeight={6}
                    onClick={onClose}
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
                    _focus={{
                      background: currentTheme?.primaryColor ?? 'primary.700',
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
                  >
                    Apply
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

export default observer(FilterProcessModal);
