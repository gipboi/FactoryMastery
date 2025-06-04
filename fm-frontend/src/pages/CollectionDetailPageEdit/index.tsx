/* eslint-disable max-lines */
import { Search2Icon } from '@chakra-ui/icons';
import {
  Button,
  Center,
  chakra,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Switch,
  Tag,
  Text,
  Textarea,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import { uploadFile } from 'API/cms';
import { updateCollection, updateCollectionById } from 'API/collection';
import ConfirmModal from 'components/Chakra/ConfirmModal';
import FormInput from 'components/Chakra/FormInput';
import ProcedureIcon from 'components/Common/ProcedureIcon';
import CustomInputDropdown from 'components/CustomInputDropdown';
import { MediaFileType } from 'components/MediaManager';
import SvgIcon from 'components/SvgIcon';
import { Collections } from 'constants/collection';
import { GroupMemberPermissionEnum } from 'constants/enums/group';
import { AuthRoleNameEnum } from 'constants/user';
import { useStores } from 'hooks/useStores';
import { ICollectionDetailForm } from 'interfaces/collection';
import { IGroup } from 'interfaces/groups';

import { ReactComponent as SortIcon } from 'assets/icons/sort.svg';
import { IProcessWithRelations } from 'interfaces/process';
import { ITheme } from 'interfaces/theme';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder';
import {
  filterValueInArray,
  getGroupOptionSelect,
} from 'pages/UserPage/components/UserListFilterDialog/utils';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { IOption } from 'types/common';
import { getValidArray } from 'utils/common';
import FilterProcessModal from './components/FilterProcess';
import { sortValidProcesses } from './utils';

const initialFormValues: ICollectionDetailForm = {
  name: '',
  isPublished: false,
  overview: '',
  groupIds: [],
  processIds: [],
};

const CollectionDetailPageEdit = () => {
  const {
    collectionStore,
    organizationStore,
    authStore,
    processStore,
    userStore,
    groupStore,
  } = useStores();
  const { currentUserGroupMembers = [] } = userStore;
  const { collection, isOpenDiscardModal } = collectionStore;
  const { processList } = processStore;
  const currentTheme: ITheme = organizationStore.organization?.theme ?? {};
  const organizationId: string = authStore.userDetail?.organizationId ?? '';
  const selectedProcesses = getValidArray(
    collection?.collectionsProcesses?.map((process) => process?.process)
  );

  const [isOpenFilterModal, setIsOpenFilterModal] = useState<boolean>(false);
  const [groupOptions, setGroupOptions] = useState<IOption<string>[]>(
    getGroupOptionSelect(groupStore?.groups)
  );
  const [selectedGroups, setSelectedGroups] = useState<IOption<string>[]>([]);
  const [processKeyword, setProcessKeyword] = useState<string>('');
  const [selectedProcessIds, setSelectedProcessIds] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(
    collection?.public ?? false
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDirtyField, setIsDirtyField] = useState<boolean>(false);

  const params = useParams();
  const fileInputRef = useRef<any>(null);
  const collectionId: string = String(get(params, 'collectionId', ''));
  const collectionGroupIds = getValidArray(collection?.groups).map(
    (group) => group?.id
  );
  const isBasicUser: boolean =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const userCanEdit: boolean =
    currentUserGroupMembers.some(
      (groupMember) =>
        collectionGroupIds.includes(groupMember?.groupId) &&
        groupMember?.permission === GroupMemberPermissionEnum.EDITOR
    ) || !isBasicUser;
  const isCollectionArchived =
    collection?.archivedAt && collection?.archivedAt !== null;

  const methods = useForm<ICollectionDetailForm>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: collection?.id
      ? {
          ...collection,
          createdAt: collection?.createdAt
            ? new Date(collection?.createdAt)?.toISOString()
            : '',
          updatedAt: collection?.updatedAt
            ? new Date(collection?.updatedAt)?.toISOString()
            : '',
        }
      : initialFormValues,
  });
  const {
    formState: { isDirty, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
  } = methods;

  const formId = 'collectionDetailEditForm';
  const [selectedFile, setSelectedFile] = useState<any>();
  const imageUrl = collection?.mainMedia
    ? (collection?.organizationId ?? '', collection.mainMedia)
    : '';

  async function handleUploadThumbnail(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    setIsUploading(true);
    try {
      const url: string = await uploadFile(
        organizationId,
        MediaFileType.IMAGE,
        event.target.files[0]
      );
      await updateCollectionById(collectionId, {
        mainMedia: url,
      });
      await collectionStore.getCollectDetail(collectionId);
      toast.success('Change image successfully');
      setIsUploading(false);
    } catch (error: any) {
      setIsUploading(false);
      toast.error('Something wrong when upload image');
    }
  }

  async function handleSwitchIsPublished(event: ChangeEvent<HTMLInputElement>) {
    const isPublished: boolean = event?.target?.checked;
    setIsPublished(isPublished);
    await updateCollectionById(collectionId, { public: isPublished });
    await collectionStore.getCollectDetail(collectionId);
  }

  function chooseAvailableGroups(value: string): void {
    const chosenGroup: IOption<string> | undefined = getValidArray(
      groupOptions
    ).find((option: IOption<string>) => option?.value === value);
    if (chosenGroup) {
      setSelectedGroups([...selectedGroups, chosenGroup]);
    }
    setIsDirtyField(true);
  }

  function removeSelectedGroup(value: string): void {
    const removedGroup: IOption<string> | undefined = getValidArray(
      selectedGroups
    ).find((option: IOption<string>) => option?.value === value);
    if (removedGroup) {
      const remainGroups: IOption<string>[] = filterValueInArray(
        value,
        selectedGroups
      );
      setSelectedGroups(remainGroups);
    }
    setIsDirtyField(true);
  }

  function handleCheckboxChange(
    id: string,
    event: ChangeEvent<HTMLInputElement>
  ): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedProcessIds([...selectedProcessIds, id]);
    } else {
      setSelectedProcessIds(
        selectedProcessIds.filter((processId) => processId !== id)
      );
    }
    setIsDirtyField(true);
  }

  function selectProcess(id: string): void {
    if (!id) return;
    if (selectedProcessIds.includes(id)) {
      setSelectedProcessIds(
        selectedProcessIds.filter((processId: string) => processId !== id)
      );
    } else {
      setSelectedProcessIds([...selectedProcessIds, id]);
    }
    setIsDirtyField(true);
  }

  function handleDiscardChanges(): void {
    setIsDirtyField(false);
    collectionStore.setIsOpenDiscardModal(false);
    collectionStore.setIsEditing(false);
    collectionStore.setManageMode(false);
  }

  async function onSubmit(): Promise<void> {
    try {
      const { name, overview } = getValues();
      const groupIds: string[] = selectedGroups.map((option) =>
        String(option.value)
      );
      const collectionUpdateBody: ICollectionDetailForm = {
        name,
        overview,
        groupIds,
        processIds: selectedProcessIds,
      };
      await updateCollection(collectionUpdateBody, collectionId);
      await collectionStore.getCollectDetail(collectionId);
      collectionStore.setIsOpenDiscardModal(false);
      collectionStore.setIsEditing(false);
      collectionStore.setManageMode(false);
      toast.success(Collections.UPDATE_SUCCESS);
    } catch (error: any) {
      toast.error(Collections.UPDATE_FALSE);
    }
  }

  async function fetchGroupData(): Promise<void> {
    await groupStore.getGroups({ where: { organizationId } });
    setGroupOptions(getGroupOptionSelect(groupStore?.groups));
    setSelectedGroups(
      getGroupOptionSelect(
        collection?.collectionGroups
          ?.map((collectionGroup) => collectionGroup?.group)
          ?.filter((collection) => !!collection)
      )
    );
    setIsPublished(collection?.public ?? false);
  }

  useEffect(() => {
    fetchGroupData();
  }, [organizationId, collection, collection?.collectionsProcesses]);

  useEffect(() => {
    processStore.changeSearchText(processKeyword, 0, organizationId);
  }, [processKeyword]);

  useEffect(() => {
    if (collection?.id) {
      reset({
        ...collection,
        name: String(collection?.name),
        groupIds: getValidArray(collection?.groups?.map((group) => group.id)),
        processIds: getValidArray(
          collection?.collectionsProcesses?.map(
            (processes) => processes.processId
          )
        ),
      });
      setIsPublished(collection?.isPublished);
      setSelectedProcessIds(
        collection?.collectionsProcesses
          ?.map((process) => process?.processId)
          .filter((id): id is string => id !== undefined) || []
      );
    }
  }, [collection]);

  useEffect(() => {
    const remainGroups: IGroup[] = getValidArray(groupStore.groups).filter(
      (group: IGroup) =>
        !getValidArray(selectedGroups).find(
          (option: IOption<string>) => option?.value === String(group?.id)
        )
    );
    setGroupOptions(getGroupOptionSelect(remainGroups));
  }, [selectedGroups]);

  useEffect(() => {
    if (isDirty || isDirtyField) {
      collectionStore.setIsEditing(true);
    } else {
      collectionStore.setIsEditing(false);
    }
  }, [isDirty, isDirtyField]);

  return (
    <VStack marginTop="16px" width="full" height="full" spacing="6">
      {/* {userCanEdit && (
        <HStack justifyContent="flex-end" width="full">
          <Button
            gap={2}
            variant="outline"
            color="gray.700"
            background="white"
            fontWeight={500}
            lineHeight={6}
            // onClick={() => setIsOpenLeaveCommentModal(true)}
          >
            <SvgIcon iconName="ic_outline-forum" size={16} />
            Note
          </Button>
          <Button
            gap={2}
            variant="outline"
            color="gray.700"
            background="white"
            fontWeight={500}
            lineHeight={6}
            // onClick={() => setIsOpenLeaveNoteModal(true)}
          >
            <SvgIcon iconName="outline-message" size={16} />
            Comment
          </Button>
        </HStack>
      )} */}
      <Stack
        width="full"
        align="flex-start"
        flexDirection={{ base: 'column', md: 'row' }}
        gap={6}
        spacing={0}
      >
        <FormProvider {...methods}>
          <chakra.form
            id={formId}
            onSubmit={handleSubmit(onSubmit)}
            width="full"
          >
            <VStack width="full" background="white" borderRadius={8}>
              <VStack
                width="full"
                height="full"
                align="flex-start"
                padding={4}
                spacing={6}
              >
                <HStack
                  width="full"
                  minWidth="max-content"
                  justify="space-between"
                  spacing={4}
                >
                  <HStack
                    spacing={2}
                    alignItems="center"
                    alignSelf="flex-start"
                  >
                    <Text
                      color="gray.800"
                      fontSize="lg"
                      fontWeight={600}
                      lineHeight={7}
                    >
                      Detail
                    </Text>
                  </HStack>
                  <HStack>
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={isSubmitting}
                      hidden={!isDirty && !isDirtyField}
                      border={0}
                      fontWeight={500}
                      color="gray.700"
                      background="transparent"
                      _hover={{ background: 'gray.200' }}
                      _active={{ background: 'gray.300' }}
                      onClick={() =>
                        collectionStore.setIsOpenDiscardModal(true)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      type="submit"
                      form={formId}
                      variant="outline"
                      isLoading={isSubmitting}
                      disabled={!isDirty && !isDirtyField}
                      fontWeight={500}
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
                      leftIcon={<SvgIcon iconName="ic-save" size={14} />}
                    >
                      Save
                    </Button>
                  </HStack>
                </HStack>
                <FormInput
                  name="name"
                  label="Collection name"
                  autoComplete="off"
                />
                <FormControl id="overview">
                  <FormLabel color="#313a46">Description</FormLabel>
                  <Textarea {...register('overview')} />
                </FormControl>
                <VStack width="full" alignItems="flex-start" spacing={3}>
                  <CustomInputDropdown
                    name="groups"
                    label="Select group to share"
                    placeholder="Search group by name"
                    optionsData={groupOptions}
                    selectedData={selectedGroups}
                    chooseOptionsHandler={chooseAvailableGroups}
                  />
                  <Wrap>
                    {getValidArray(selectedGroups).map((group) => (
                      <Tag
                        key={group?.value}
                        size="lg"
                        gap={1}
                        color="gray.700"
                        border="1px solid #E2E8F0"
                      >
                        {group?.label}
                        <SvgIcon
                          iconName="ic_baseline-close"
                          size={12}
                          cursor="pointer"
                          onClick={() => removeSelectedGroup(group?.value)}
                        />
                      </Tag>
                    ))}
                    {getValidArray(selectedGroups)?.length > 0 && (
                      <Center>
                        <Text
                          as="u"
                          fontSize="md"
                          color="gray.600"
                          cursor="pointer"
                          onClick={() => {
                            setSelectedGroups([]);
                            setIsDirtyField(true);
                          }}
                        >
                          Clear all
                        </Text>
                      </Center>
                    )}
                  </Wrap>
                </VStack>
                <VStack width="full" align="flex-start" spacing={3}>
                  <Text
                    fontSize="16px"
                    color="gray.700"
                    fontWeight="500"
                    lineHeight="24px"
                    marginBottom={0}
                    alignSelf="flex-start"
                  >
                    Processes
                  </Text>
                  <HStack
                    justifyContent="space-between"
                    spacing={4}
                    width="full"
                  >
                    <InputGroup borderRadius="6px" background="white">
                      <InputLeftElement pointerEvents="none">
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="search"
                        placeholder="Search processes by name"
                        onChange={(event) =>
                          setProcessKeyword(event?.currentTarget?.value)
                        }
                      />
                    </InputGroup>
                    <Button
                      style={{ marginLeft: 16 }}
                      backgroundColor="white"
                      gap={{ base: 0, md: 2 }}
                      border="1px solid #E2E8F0"
                      borderRadius="6px"
                      cursor="pointer"
                      padding={{ base: '10px', md: '16px' }}
                      variant="solid"
                      onClick={() => setIsOpenFilterModal(true)}
                    >
                      <SortIcon width={32} />
                      <Text
                        marginBottom="0"
                        fontWeight={500}
                        fontSize={{
                          base: '0px',
                          md: '16px',
                        }}
                        lineHeight="24px"
                        color="gray.700"
                      >
                        {`Filter`}
                      </Text>
                    </Button>
                    <Text
                      as="u"
                      minWidth="max-content"
                      fontSize="sm"
                      color="gray.600"
                      cursor="pointer"
                      onClick={() => {
                        setSelectedProcessIds([]);
                        setIsDirtyField(true);
                      }}
                    >
                      Clear all
                    </Text>
                  </HStack>
                  <VStack
                    width="full"
                    maxHeight="240px"
                    overflowY="scroll"
                    align="flex-start"
                    background="gray.50"
                    borderRadius={4}
                    spacing={0}
                  >
                    {sortValidProcesses(
                      processList,
                      selectedProcesses,
                      processKeyword
                    ).map((process: IProcessWithRelations) => {
                      if (!process?.id) {
                        return <></>;
                      }
                      const { id, name, procedureIcon, documentType } = process;
                      const isChecked: boolean = id
                        ? selectedProcessIds.includes(id)
                        : false;
                      const icon = documentType?.iconBuilder;
                      return (
                        <HStack
                          key={id}
                          width="full"
                          padding={2}
                          spacing={3}
                          background={isChecked ? '#DBF8FF' : 'white'}
                          _hover={{ cursor: 'pointer', background: '#DBF8FF' }}
                        >
                          <Checkbox
                            isChecked={isChecked}
                            onChange={(e) => handleCheckboxChange(id, e)}
                            margin={0}
                          />
                          <HStack
                            width="full"
                            align="center"
                            spacing={3}
                            onClick={() => selectProcess(id)}
                          >
                            {icon ? (
                              <IconBuilder icon={icon} size={24} isActive />
                            ) : (
                              <ProcedureIcon
                                procedureIcon={procedureIcon}
                                size={24}
                              />
                            )}
                            <Text
                              fontSize="14px"
                              color="#313A46"
                              fontWeight="500"
                              lineHeight="20px"
                              marginBottom={0}
                            >
                              {name}
                            </Text>
                          </HStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                </VStack>
              </VStack>
            </VStack>
          </chakra.form>
        </FormProvider>
        <VStack
          width="full"
          maxWidth={{ base: 'full', md: '313px' }}
          align="flex-start"
          spacing={6}
        >
          <VStack
            width="full"
            align="flex-start"
            background="white"
            borderRadius={8}
            padding={4}
            spacing={4}
          >
            <Text
              color="gray.800"
              fontSize="lg"
              fontWeight={600}
              lineHeight={7}
            >
              Thumbnail
            </Text>
            <Image
              width="full"
              borderRadius={8}
              objectFit="contain"
              alt={collection?.mainMedia ?? ''}
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : imageUrl ?? ''
              }
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadThumbnail}
              style={{ display: 'none' }}
            />
            {userCanEdit && !isCollectionArchived && (
              <Button
                gap={2}
                width="full"
                variant="outline"
                color="gray.700"
                background="white"
                fontSize="16px"
                fontWeight="500"
                lineHeight="24px"
                isLoading={isUploading}
                onClick={() => fileInputRef?.current?.click()}
              >
                <SvgIcon size={16} iconName="ic_outline-file-upload" />
                Change image
              </Button>
            )}
          </VStack>
          <VStack
            width="full"
            align="flex-start"
            background="white"
            borderRadius={8}
            padding={4}
            spacing={4}
          >
            <Text
              color="gray.800"
              fontSize="lg"
              fontWeight={600}
              lineHeight={7}
            >
              Visibility
            </Text>
            <HStack>
              <Switch
                margin={0}
                isChecked={isPublished}
                onChange={(e) => handleSwitchIsPublished(e)}
                colorScheme="primary"
              />
              <Text
                color="gray.700"
                fontSize="md"
                fontWeight={500}
                lineHeight={6}
              >
                Visible for Viewers
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Stack>

      {isOpenFilterModal && (
        <FilterProcessModal
          isOpen={isOpenFilterModal}
          onClose={() => setIsOpenFilterModal(!isOpenFilterModal)}
        />
      )}
      {isOpenDiscardModal && (
        <ConfirmModal
          titleText="Unsaved changes"
          bodyText="Your changes on this page were not saved. Do you want to save changes before switching to view mode?"
          cancelButtonText="Discard changes"
          confirmButtonText="Save"
          isOpen={isOpenDiscardModal}
          onClose={() => collectionStore.setIsOpenDiscardModal(false)}
          onClickAccept={onSubmit}
          onClickCancel={handleDiscardChanges}
        />
      )}
    </VStack>
  );
};

export default observer(CollectionDetailPageEdit);
