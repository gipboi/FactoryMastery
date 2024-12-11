import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import Button from "components/Button";
import FilterDropdown from "components/FilterDropdown";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { IProcessesFilterForm } from "interfaces/process";
import { ITheme } from "interfaces/theme";
import { set } from "lodash";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import { primary, primary500 } from "themes/globalStyles";
import { IOption } from "types/common/select";
import { getValidArray } from "utils/common";
import { EDraftTab, EProcessesFilterFormName } from "../../constants";

interface ProcessFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProcessFilterDialog = (props: ProcessFilterDialogProps) => {
  const { isOpen, onClose } = props;
  const {
    organizationStore,
    processStore,
    authStore,
    userStore,
    documentTypeStore,
    tagStore,
    groupStore,
    // collectionStore,
  } = useStores();
  const { userDetail } = authStore;
  const { currentUserGroupMembers } = userStore;
  const { processesFilter } = processStore;
  const { organization } = organizationStore;
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const userGroupIds = currentUserGroupMembers.map(
    (groupMember) => groupMember.groupId
  );
  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const currentTheme: ITheme = organization?.theme ?? {};
  const organizationId = organization?.id ?? 0;
  const [selectedGroups, setSelectedGroups] = useState<IOption<string>[]>([]);
  const [selectedTags, setSelectedTags] = useState<IOption<string>[]>([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<
    IOption<string>[]
  >([]);
  const [selectedCollections, setSelectedCollections] = useState<
    IOption<string>[]
  >([]);
  const persistedTab = `${params.get("tab") || EDraftTab.PROCESS}` as EDraftTab;

  const defaultValues: Omit<IProcessesFilterForm, "creators" | "sort"> = {
    collections: [],
    documentTypes: [],
    groups: [],
    tags: [],
  };

  const methods = useForm<Omit<IProcessesFilterForm, "creators" | "sort">>({
    defaultValues,
    mode: "onChange",
    resolver: async (data) => {
      return {
        values: data,
        errors: {},
      };
    },
  });

  const { handleSubmit, setValue } = methods;

  function onSubmit(data: Omit<IProcessesFilterForm, "creators" | "sort">) {
    processStore.setProcessesFilter({
      ...processStore.processesFilter,
      ...data,
    });
    params.set("page", "1");
    params.set(
      "collectionIds",
      data?.collections?.length > 0
        ? data.collections.map((collection) => collection.value).join(",")
        : ""
    );
    params.set(
      "documentTypeIds",
      data?.documentTypes?.length > 0
        ? data.documentTypes.map((documentType) => documentType.value).join(",")
        : ""
    );
    params.set(
      "groupIds",
      data?.groups?.length > 0
        ? data.groups.map((group) => group.value).join(",")
        : ""
    );
    params.set(
      "tagIds",
      data?.tags?.length
        ? data.tags.map((tag) => tag?.value ?? "").join(",")
        : ""
    );
    params.set("filter", `${JSON.stringify(data)}`);

    navigate(`${routes.processes.value}?${params.toString()}`);
    onClose();
  }

  function handleSelectedOptions(
    options: IOption<string>[],
    name: EProcessesFilterFormName,
    setSelectedOptions: (options: IOption<string>[]) => void
  ): void {
    const values = getValidArray(options).map((option) => {
      return { label: option?.label, value: option?.value };
    });
    setValue(`${name}`, values);
    setSelectedOptions(options);
  }

  useEffect(() => {
    if (!isOpen) return;

    if (persistedTab === EDraftTab.PROCESS) {
      // collectionStore.fetchCollectionsByFilter({
      //   userId: userDetail?.id,
      //   organizationId,
      //   isPublished: true,
      // });
    }
    tagStore.fetchTags({
      where: { organizationId: String(organizationId) },
      order: ["name ASC"],
      fields: ["id", "name"],
    });
    documentTypeStore.fetchDocumentTypes({
      where: { organizationId: String(organizationId) },
      // include: ["iconBuilder"],
      fields: ["id", "name"],
    });
    const filterGroup = {
      where: { organizationId: String(organizationId) },
    };
    if (isBasicUser) {
      set(filterGroup, "where._id", { $in: userGroupIds });
    }
    groupStore.getGroups(filterGroup);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent
            minWidth={{ base: "full", md: "800px" }}
            borderRadius={8}
          >
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              More filters
            </ModalHeader>
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody border="1px solid #E2E8F0" padding={6}>
              <VStack>
                {/* {persistedTab === EDraftTab.PROCESS && (
                  // <FilterDropdown
                    // isOpenModal={isOpen}
                    // name={EProcessesFilterFormName.COLLECTION}
                    // label="Collections"
                    // placeholder="Search collections by name"
                    // storeOptions={getValidArray(collectionStore.collections)}
                    // filteredOptions={getValidArray(
                    //   processesFilter?.collections
                    // )}
                    // selectedOptions={selectedCollections}
                    // setSelectedOptions={(options: IOption<string>[]) =>
                    //   handleSelectedOptions(
                    //     options,
                    //     EProcessesFilterFormName.COLLECTION,
                    //     setSelectedCollections
                    //   )
                    // }
                  // />
                )} */}
                <FilterDropdown
                  isOpenModal={isOpen}
                  name={EProcessesFilterFormName.DOCUMENT_TYPE}
                  label="Document Types"
                  placeholder="Search document types by name"
                  storeOptions={getValidArray(documentTypeStore.documentTypes)}
                  filteredOptions={getValidArray(
                    processesFilter?.documentTypes
                  )}
                  selectedOptions={selectedDocumentTypes}
                  setSelectedOptions={(options: IOption<string>[]) =>
                    handleSelectedOptions(
                      options,
                      EProcessesFilterFormName.DOCUMENT_TYPE,
                      setSelectedDocumentTypes
                    )
                  }
                />
                <FilterDropdown
                  isOpenModal={isOpen}
                  name={EProcessesFilterFormName.GROUP}
                  label="Groups"
                  placeholder="Search groups by name"
                  storeOptions={getValidArray(groupStore.groups)}
                  filteredOptions={getValidArray(processesFilter?.groups)}
                  selectedOptions={selectedGroups}
                  setSelectedOptions={(options: IOption<string>[]) =>
                    handleSelectedOptions(
                      options,
                      EProcessesFilterFormName.GROUP,
                      setSelectedGroups
                    )
                  }
                />
                <FilterDropdown
                  isOpenModal={isOpen}
                  name={EProcessesFilterFormName.TAG}
                  label="Tags"
                  placeholder="Search tags by name"
                  storeOptions={getValidArray(tagStore.tags)}
                  filteredOptions={getValidArray(processesFilter?.tags)}
                  selectedOptions={selectedTags}
                  setSelectedOptions={(options: IOption<string>[]) =>
                    handleSelectedOptions(
                      options,
                      EProcessesFilterFormName.TAG,
                      setSelectedTags
                    )
                  }
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack width="full" justify="flex-end">
                <Button
                  variant="outline"
                  background="gray.200"
                  color="gray.700"
                  fontWeight={500}
                  fontSize="md"
                  lineHeight={6}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fontWeight={500}
                  fontSize="md"
                  color="white"
                  lineHeight={6}
                  background={currentTheme?.primaryColor ?? primary500}
                  _hover={{ opacity: 0.8 }}
                >
                  Apply
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default observer(ProcessFilterDialog);
