/* eslint-disable max-lines */
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
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import ChakraFormRadioGroup from "components/ChakraFormRadioGroup";
import CustomDatePickerWithMask from "components/CustomDaterRangePickerWithMask";
import { EBreakPoint } from "constants/theme";
import { AuthRoleNameEnum } from "constants/user";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import set from "lodash/set";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import { primary, primary500 } from "themes/globalStyles";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import FilterInput from "./components/FilterInput";
import { ECollectionFilterName, IFilterForm, sortByOptions } from "./contants";
import { filterSubmitItems } from "./utils";

const PICKER_DATE_FORMAT = "MM/dd/yyyy";
const DATE_INPUT_FORMAT = "##/##/#### - ##/##/####";
const DATE_INPUT_MASK = [
  "M",
  "M",
  "D",
  "D",
  "Y",
  "Y",
  "Y",
  "Y",
  "M",
  "M",
  "D",
  "D",
  "Y",
  "Y",
  "Y",
  "Y",
];

interface IFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterModal = (props: IFilterModalProps) => {
  const { isOpen, onClose } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const {
    authStore,
    groupStore,
    processStore,
    organizationStore,
    documentTypeStore,
    tagStore,
  } = useStores();
  const { userDetail } = authStore;
  const { groupMembers } = groupStore;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const organizationId: string = userDetail?.organizationId ?? "";
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  const [selectedGroups, setSelectedGroups] = useState<IOption<string>[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<IOption<string>[]>(
    []
  );
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<
    IOption<string>[]
  >([]);
  const [selectedTags, setSelectedTags] = useState<IOption<string>[]>([]);

  const methods = useForm<IFilterForm>();
  const { handleSubmit, reset, setValue, control } = methods;

  function clearAllFilters(): void {
    setSelectedGroups([]);
    setSelectedProcesses([]);
    setSelectedDocumentTypes([]);
    setSelectedTags([]);
    setValue(`${ECollectionFilterName.SORT_BY}`, "");
    setValue(`${ECollectionFilterName.MODIFIED_DATE}`, []);
    navigate(routes.collections.value);
  }

  async function prefillFormData(): Promise<void> {
    const filterGroup = {
      where: { organizationId },
    };
    if (isBasicUser) {
      set(filterGroup.where, "id", {
        inq: getValidArray(groupMembers).map(
          (groupMember) => groupMember?.groupId
        ),
      });
    }
    await groupStore.getGroups(filterGroup);

    const sortBy: string = params.get("sortBy") ?? "";
    const modifiedDate: Date[] = params.get(
      `${ECollectionFilterName.MODIFIED_DATE}`
    )
      ? params
          .get(`${ECollectionFilterName.MODIFIED_DATE}`)
          ?.split(",")
          ?.map((value: string) => new Date(value)) ?? []
      : [];

    reset({ sortBy, modifiedDate });
  }

  async function onSubmit(data: IFilterForm): Promise<void> {
    params.set("sortBy", data?.sortBy ?? "");
    params.set(
      ECollectionFilterName.GROUPS,
      filterSubmitItems(selectedGroups) ?? ""
    );
    params.set(
      ECollectionFilterName.PROCESS,
      filterSubmitItems(selectedProcesses) ?? ""
    );
    params.set(
      ECollectionFilterName.PROCESS_DOCUMENT_TYPES,
      filterSubmitItems(selectedDocumentTypes) ?? ""
    );
    params.set(
      ECollectionFilterName.PROCESS_TAGS,
      filterSubmitItems(selectedTags) ?? ""
    );
    const isoDates = data?.modifiedDate?.map((date) => date.toISOString());
    if (getValidArray(isoDates).length > 0) {
      params.set(`${ECollectionFilterName.MODIFIED_DATE}`, isoDates.join(","));
    }
    navigate(`${routes.collections.value}?${params.toString()}`);
    onClose();
  }

  useEffect(() => {
    if (isOpen) {
      prefillFormData();
      processStore.getAllProcessList(organizationId, 0);
    }
  }, [isOpen, organizationId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent minWidth={isMobile ? "auto" : "800px"} borderRadius={8}>
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
            <ModalBody borderTop="1px solid #E2E8F0" padding={6}>
              <Stack
                flexDirection={{
                  base: "column",
                  md: "row",
                }}
                width="full"
                alignItems="flex-start"
              >
                <VStack width="235px" alignItems="flex-start">
                  <ChakraFormRadioGroup
                    name="sortBy"
                    label="Sort By"
                    optionsData={sortByOptions}
                  />
                </VStack>
                <VStack width="full" alignItems="flex-start" spacing={6}>
                  <FilterInput
                    isOpenModal={isOpen}
                    name={ECollectionFilterName.PROCESS}
                    label="Included process"
                    placeholder="Search processes by name"
                    storeOptions={getValidArray(processStore.processList)}
                    selectedOptions={selectedProcesses}
                    setSelectedOptions={(value) => setSelectedProcesses(value)}
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
                  <FilterInput
                    isOpenModal={isOpen}
                    name={ECollectionFilterName.GROUPS}
                    label="Shared group"
                    placeholder="Search groups by name"
                    storeOptions={getValidArray(groupStore.groups)}
                    selectedOptions={selectedGroups}
                    setSelectedOptions={(value) => setSelectedGroups(value)}
                  />

                  <VStack width="full" alignItems="flex-start">
                    <FormControl id={`${ECollectionFilterName.MODIFIED_DATE}`}>
                      <FormLabel color="gray.700">Last modified</FormLabel>
                      <Controller
                        name={`${ECollectionFilterName.MODIFIED_DATE}`}
                        control={control}
                        render={(datePickerProps: any) => {
                          return (
                            <CustomDatePickerWithMask
                              name={`${ECollectionFilterName.MODIFIED_DATE}`}
                              dateFormat={PICKER_DATE_FORMAT}
                              inputFormat={DATE_INPUT_FORMAT}
                              inputMask={DATE_INPUT_MASK}
                              inputPlaceholder="__/__/____ - __/__/____"
                              setValue={setValue}
                              {...datePickerProps}
                            />
                          );
                        }}
                      />
                    </FormControl>
                  </VStack>
                </VStack>
              </Stack>
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
                  onClick={clearAllFilters}
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
                    background={currentTheme?.primaryColor ?? primary500}
                    _hover={{
                      opacity: "0.8",
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

export default observer(FilterModal);
