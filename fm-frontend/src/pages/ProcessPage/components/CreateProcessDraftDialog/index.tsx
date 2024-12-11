import cx from "classnames";
import { ProcessType, ProcessTypeColors } from "config/constant/enums/process";
import { useStores } from "hooks/useStores";
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { IFilter, IOption, IOptionWithIcon, UpdateBody } from "types/common";
// import { getDocumentTypes } from 'API/documentType'
// import { getTags } from 'API/tag'
// import { validatePatternVersion } from 'components/Pages/ProcessDetailPage/components/SaveDraftDialog/utils'
import { IDocumentType } from "interfaces/documentType";
import { IProcess } from "interfaces/process";
import { ITag } from "interfaces/tag";
import {
  FormLabel,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  HStack,
  ModalFooter,
  VStack,
  ModalOverlay,
  Button,
  Input,
} from "@chakra-ui/react";
import { validatePatternVersion } from "pages/ProcessDetailPage/components/SaveDraftDialog/utils";
import { getValidArray } from "utils/common";
import FilterDropdown from "components/FilterDropdown";
import { ECreateProcessFormEnum } from "./constants";
import { primary500 } from "themes/globalStyles";
import { ITheme } from "interfaces/theme";

interface ICreateProcessDraftDialogProps {
  onClose: () => void;
  isOpen: boolean;
  refetch: (organizationId: string) => void;
  onSubmitProcess: (request: UpdateBody<IProcess>) => void;
}

interface ICreateDraftForm {
  name: string;
  releaseNote: string;
  version: string;
  documentTypeId?: IOptionWithIcon<string>[];
  tags?: IOptionWithIcon<string>[];
}

const CreateProcessDraftDialog = ({
  onClose,
  isOpen,
  refetch,
  onSubmitProcess,
}: ICreateProcessDraftDialogProps) => {
  const {
    authStore,
    organizationStore,
    documentTypeStore,
    tagStore,
    processStore,
  } = useStores();
  const { processesFilter } = processStore;
  const { userDetail } = authStore;
  const currentTheme: ITheme = organizationStore?.organization?.theme ?? {};
  const methods = useForm({
    defaultValues: {
      version: "1.0.0",
      name: "",
      releaseNote: "",
      tags: [],
      documentTypeId: [],
    },
  });
  const { register, control, reset, setValue } = methods;
  const [processType, setProcessType] = useState<ProcessType>(ProcessType.BOLT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processTypeColor, setProcessTypeColor] = useState(
    ProcessTypeColors[0]
  );
  const version: string = useWatch({ name: "version", control }) || "";
  const [selectedTags, setSelectedTags] = useState<IOption<string>[]>([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<
    IOption<string>[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      tagStore.fetchTags({
        where: { organizationId: String(userDetail?.organizationId) },
        order: ["name ASC"],
        fields: ["id", "name"],
      });
      documentTypeStore.fetchDocumentTypes({
        where: { organizationId: String(userDetail?.organizationId) },
        fields: ["id", "name"],
      });
    }
    setProcessType(ProcessType.BOLT);
    setProcessTypeColor(ProcessTypeColors[0]);
    reset({
      name: "",
      releaseNote: "",
      version: "1.0.0",
      documentTypeId: [],
      tags: [],
    });
  }, [isOpen]);

  async function onSubmit(data: ICreateDraftForm) {
    const { name, releaseNote, version, tags, documentTypeId } = data;
    const tagIds = tags?.map((tag) => tag.value);
    const newData = {
      name,
      version,
      releaseNote,
      procedureIconType: processType,
      procedureIconColor: processTypeColor,
      isPublished: true,
      organizationId: userDetail?.organizationId
        ? String(userDetail.organizationId)
        : "",
      userId: userDetail?.id ? String(userDetail.id) : undefined,
      documentTypeId: documentTypeId?.[0]?.value,
      tagIds,
    };

    try {
      setIsLoading(true);
      onSubmitProcess(newData);
      toast.success("Create draft successfully");
      refetch(String(userDetail?.organizationId) ?? "");
      onClose();
    } catch (error: any) {
      toast.error("Create draft failed");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectedOptions(
    options: IOption<string>[],
    name: ECreateProcessFormEnum,
    setSelectedOptions: (options: IOption<string>[]) => void
  ): void {
    const values = getValidArray(options).map((option) => {
      return { label: option?.label, value: option?.value };
    });
    setValue(`${name}`, values as any);
    setSelectedOptions(options);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent
        borderRadius={8}
        marginTop={0}
        containerProps={{ alignItems: "center" }}
      >
        <ModalHeader
          fontSize="18px"
          lineHeight={7}
          fontWeight="500"
          color="gray.800"
        >
          Create Process Draft
        </ModalHeader>
        <ModalCloseButton
          width="40px"
          height="40px"
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
          onClick={onClose}
        />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <ModalBody border="1px solid #E2E8F0" padding={6}>
              <VStack spacing={6} width="full">
                <FormControl id="name">
                  <FormLabel marginBottom={2} color="gray.700">
                    Process Name
                  </FormLabel>
                  <Input
                    placeholder="Enter type process name"
                    {...register("name", {
                      required: "This field is required",
                    })}
                  />
                </FormControl>

                <FormControl id="version">
                  <FormLabel marginBottom={2} color="gray.700">
                    Process Version
                  </FormLabel>
                  <Input
                    placeholder="Enter type process name"
                    onKeyDown={(event: any) =>
                      validatePatternVersion(event, version)
                    }
                    {...register("version")}
                  />
                </FormControl>

                <FormControl id="releaseNote">
                  <FormLabel marginBottom={2} color="gray.700">
                    Release Notes
                  </FormLabel>
                  <Input {...register("releaseNote")} />
                </FormControl>

                <FilterDropdown
                  isOpenModal={isOpen}
                  isSelectSingleOption={true}
                  name={ECreateProcessFormEnum.DOCUMENT_TYPE}
                  label="Document Type"
                  placeholder="Search document types by name"
                  storeOptions={getValidArray(documentTypeStore.documentTypes)}
                  filteredOptions={getValidArray(
                    processesFilter?.documentTypes
                  )}
                  selectedOptions={selectedDocumentTypes}
                  setSelectedOptions={(options: IOption<string>[]) =>
                    handleSelectedOptions(
                      options,
                      ECreateProcessFormEnum.DOCUMENT_TYPE,
                      setSelectedDocumentTypes
                    )
                  }
                />

                <FilterDropdown
                  isOpenModal={isOpen}
                  name={ECreateProcessFormEnum.TAGS}
                  label="Tags"
                  placeholder="Search tags by name"
                  storeOptions={getValidArray(tagStore.tags)}
                  filteredOptions={getValidArray(processesFilter?.tags)}
                  selectedOptions={selectedTags}
                  setSelectedOptions={(options: IOption<string>[]) =>
                    handleSelectedOptions(
                      options,
                      ECreateProcessFormEnum.TAGS,
                      setSelectedTags
                    )
                  }
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack justifyContent="flex-start" width="full">
                <HStack spacing={4} justifyContent="flex-end" width="full">
                  <Button
                    color="gray.700"
                    lineHeight={6}
                    border="1px solid #E2E8F0"
                    border-radius="6px"
                    background="white"
                    paddingY={2}
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    paddingY={2}
                    paddingX={4}
                    outline="unset"
                    border="unset"
                    background="primary.500"
                    color="white"
                    backgroundColor={currentTheme?.primaryColor ?? primary500}
                    _hover={{ opacity: 0.8 }}
                    _focus={{ opacity: 1 }}
                    _active={{ opacity: 1 }}
                    borderRadius="6px"
                    fontWeight={500}
                    fontSize="16px"
                    lineHeight="24px"
                    isLoading={isLoading}
                    type="submit"
                  >
                    Create
                  </Button>
                </HStack>
              </HStack>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};

export default observer(CreateProcessDraftDialog);
