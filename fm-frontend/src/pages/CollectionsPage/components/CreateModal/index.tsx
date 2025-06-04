import {
  Button,
  Center,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  Textarea,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { createCollection } from "API/collection";
import ProcedureIcon from "components/Common/ProcedureIcon";
import CustomInputDropdown from "components/CustomInputDropdown";
// import { filterValueInArray } from "components/Pages/UserPage/UserListFilterDialog/utils";
import { Search2Icon } from "@chakra-ui/icons";
import Spinner from "components/Spinner";
import SvgIcon from "components/SvgIcon";
import { Collections } from "constants/collection";
import { useStores } from "hooks/useStores";
import { ICollectionDetailForm } from "interfaces/collection";
import { IGroup } from "interfaces/groups";
import { IProcessWithRelations } from "interfaces/process";
import { observer } from "mobx-react";
import { filterValueInArray } from "pages/GroupPage/components/GroupFilterDialog/utils";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { primary100 } from "pages/UserPage/components/UserList/constants";
import { getGroupOptionSelect } from "pages/UserPage/components/UserListFilterDialog/utils";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "routes";
import { primary500 } from "themes/globalStyles";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { ITheme } from "../../../../interfaces/theme";
import { ProcessType, ProcessTypeColors } from "config/constant/enums/process";

interface ICreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
  isDraft?: boolean;
}

const CreateModal = (props: ICreateModalProps) => {
  const { isOpen, onClose, reloadData, isDraft } = props;
  const navigate = useNavigate();
  const { authStore, processStore, organizationStore, groupStore } =
    useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { processList, isSearching } = processStore;
  const organizationId: string = authStore?.userDetail?.organizationId ?? "";
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [processIds, setProcessIds] = useState<string[]>([]);
  const { groups } = groupStore;
  const [groupOptions, setGroupOptions] = useState<IOption<string>[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<IOption<string>[]>([]);
  const method = useForm<ICollectionDetailForm>();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
    reset,
  } = method;

  function handleOnClose() {
    onClose();
    reset();
    setSearchTerm("");
    setProcessIds([]);
    setSelectedGroups([]);
  }

  function selectProcess(id: string): void {
    if (!id) return;
    if (processIds?.includes(id)) {
      setProcessIds((prevProcessIds) =>
        prevProcessIds.filter((processId: string) => processId !== id)
      );
    } else {
      setProcessIds([...processIds, id]);
    }
  }

  async function onSubmit(data: ICollectionDetailForm): Promise<void> {
    const { name, overview, isVisible } = data;
    const groupIds: string[] = selectedGroups.map((option) =>
      String(option.value)
    );

    // if (!name || !overview || (processIds?.length === 0 && !isDraft)) {
    //   toast.warning(Collections.WARNING);
    //   return;
    // }

    if (!groupIds?.length && !isDraft) {
      toast.warning(Collections.GROUP_WARNING);
      return;
    }

    try {
      const newDraftCollection = await createCollection({
        name,
        overview,
        isVisible,
        processIds,
        organizationId,
        groupIds,
        isPublished: !isDraft,
      });
      reloadData();
      handleOnClose();
      toast.success(isDraft ? Collections.SUCCESS_DRAFT : Collections.SUCCESS);
      navigate(
        `${routes.collections.collectionId.value(`${newDraftCollection.id}`)}`
      );
    } catch (error: any) {
      toast.error(Collections.FALSE);
    }
  }

  useEffect(() => {
    if (isOpen) {
      processStore.changeSearchText(searchTerm, 0, organizationId);
    }
  }, [searchTerm]);

  useEffect(() => {
    groupStore.getGroups({
      where: { organizationId },
    });
  }, [organizationId]);

  useEffect(() => {
    const remainGroups: IGroup[] = getValidArray(groups).filter(
      (group: IGroup) =>
        !getValidArray(selectedGroups).find(
          (option: IOption<string>) => option?.value === String(group?.id)
        )
    );
    setGroupOptions(getGroupOptionSelect(remainGroups));
  }, [selectedGroups]);

  useEffect(() => {
    setGroupOptions(getGroupOptionSelect(groups));
  }, [groups]);

  function handleSelectGroups(value: string): void {
    const chosenGroup: IOption<string> | undefined = getValidArray(
      groupOptions
    ).find((option: IOption<string>) => option?.value === value);
    if (chosenGroup) {
      setSelectedGroups([...selectedGroups, chosenGroup]);
    }
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
  }

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={handleOnClose}>
      <ModalOverlay overflowY="scroll" />
      <ModalContent maxWidth="600px" borderRadius={8}>
        <ModalHeader
          color="gray.800"
          fontSize="18px"
          lineHeight={7}
          fontWeight="500"
        >
          Create collection
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <FormProvider {...method}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody border="1px solid #E2E8F0" padding={6}>
              <VStack width="full" align="flex-start" spacing={6}>
                <FormControl>
                  <FormLabel color="gray.700">Collection name</FormLabel>
                  <Input {...register("name")} autoComplete="off" />
                </FormControl>
                <FormControl>
                  <FormLabel marginBottom={2} color="gray.700">
                    Description
                  </FormLabel>
                  <Textarea {...register("overview")} />
                </FormControl>
                {!isDraft && (
                  <>
                    <CustomInputDropdown
                      name="groups"
                      label="Groups"
                      placeholder="Search group by name"
                      optionsData={groupOptions}
                      chooseOptionsHandler={handleSelectGroups}
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
                            onClick={() => setSelectedGroups([])}
                          >
                            Clear all
                          </Text>
                        </Center>
                      )}
                    </Wrap>
                  </>
                )}
                {!isDraft && (
                  <FormControl>
                    <FormLabel color="gray.700">Processes</FormLabel>
                    <HStack
                      width="full"
                      justifyContent="space-between"
                      marginBottom={3}
                      spacing={4}
                    >
                      <InputGroup background="white" borderRadius={6}>
                        <InputLeftElement pointerEvents="none">
                          <Search2Icon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="search"
                          placeholder="Search processes by name"
                          onChange={(event: any) =>
                            setSearchTerm(event?.currentTarget?.value)
                          }
                        />
                      </InputGroup>
                      <Text
                        as="u"
                        minWidth="max-content"
                        fontSize="md"
                        color="gray.600"
                        cursor="pointer"
                        onClick={() => setProcessIds([])}
                      >
                        Clear all
                      </Text>
                    </HStack>
                    {
                      isSearching ? (
                        <Spinner />
                      ) : (
                        <VStack
                          maxHeight="240px"
                          overflowY="scroll"
                          align="flex-start"
                          background="gray.50"
                          borderRadius={4}
                          spacing={0}
                        >
                          {Array.from(
                            new Map(
                              getValidArray(processList).map((process: IProcessWithRelations) => [
                                process?.id,
                                process,
                              ])
                            ).values()
                          ).map((process: IProcessWithRelations) => {
                            const isChecked: boolean = process?.id
                              ? processIds?.includes(process?.id)
                              : false;
                            return (
                              <HStack
                                key={process?.id}
                                width="full"
                                padding={2}
                                spacing={3}
                                color="#313A46"
                                background={isChecked ? primary100 : "white"}
                                _hover={{
                                  background: primary100,
                                }}
                              >
                                <Checkbox
                                  isChecked={isChecked}
                                  onChange={() => selectProcess(process?.id)}
                                  margin={0}
                                />
                                {process?.documentType?.iconBuilder ? (
                                  <IconBuilder
                                    icon={process?.documentType?.iconBuilder}
                                    size={24}
                                    isActive
                                  />
                                ) : (
                                  <ProcedureIcon
                                    procedureIcon={{
                                      type: process?.procedureIconType ?? ProcessType.PROCESS,
                                      color: process?.procedureIconColor ?? ProcessTypeColors[0],
                                    }}
                                    size={24}
                                  />
                                )}
                                <Text
                                  fontSize="14px"
                                  fontWeight={500}
                                  lineHeight={5}
                                >
                                  {process?.name}
                                </Text>
                              </HStack>
                            );
                          })}
                        </VStack>
                      )
                    }
                  </FormControl>
                )}
                {/* // TODO: Visibility feature, Integrate later
                <Checkbox {...register('isVisible')} size="lg">
                  <FormLabel color="gray.700" margin={0}>
                    Visible for Viewers
                  </FormLabel>
                </Checkbox> */}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack width="full" justifyContent="flex-end" spacing={4}>
                <Button
                  color="gray.700"
                  background="white"
                  fontSize="16px"
                  fontWeight={500}
                  lineHeight={6}
                  border="1px solid #E2E8F0"
                  isLoading={isSubmitting}
                  onClick={handleOnClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  border="0"
                  color="white"
                  fontSize="16px"
                  fontWeight={500}
                  lineHeight={6}
                  isLoading={isSubmitting}
                  backgroundColor={currentTheme?.primaryColor ?? primary500}
                  _hover={{
                    background: currentTheme?.primaryColor ?? "primary.700",
                    opacity: currentTheme?.primaryColor ? 0.8 : 1,
                  }}
                  _focus={{
                    background: currentTheme?.primaryColor ?? "primary.700",
                    opacity: currentTheme?.primaryColor ? 0.8 : 1,
                  }}
                  _active={{
                    background: currentTheme?.primaryColor ?? "primary.700",
                    opacity: currentTheme?.primaryColor ? 0.8 : 1,
                  }}
                >
                  Create
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};
export default observer(CreateModal);
