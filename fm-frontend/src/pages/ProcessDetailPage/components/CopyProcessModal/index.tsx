import {
  Button,
  Checkbox,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import FormInput from "components/Chakra/FormInput";
import FormDropdownInput from "components/FormInputs/DropdownInput";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
// import { getDocumentTypes } from 'API/documentType'
import { useStores } from "hooks/useStores";
import { IDocumentType } from "interfaces/documentType";
import { observer } from "mobx-react";
import { IFilter, IOptionWithIcon } from "types/common";
// import { duplicateProcess } from 'API/process'
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getDocumentTypes } from "API/documentType";
import { IProcess } from "interfaces/process";
import { duplicateProcess } from "API/process";
import routes from "routes";

interface ICopyProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  processId: string;
}

export interface IProcessDuplicate {
  documentTypeId: number;
  copySharing?: boolean;
  copyTags?: boolean;
  copyNote?: boolean;
  name: string;
}

interface IProcessDuplicateForm extends IProcessDuplicate {
  documentType: IOptionWithIcon<string>;
}

const CopyProcessModal = ({
  isOpen,
  onClose,
  processId,
}: ICopyProcessModalProps) => {
  const { authStore, processStore } = useStores();
  const { selectedProcess, process } = processStore;
  const sourceProcess = selectedProcess?.id ? selectedProcess : process;
  const name = sourceProcess?.name ?? "Copy of Processes";
  const documentType = sourceProcess?.documentType ?? "";
  const methods = useForm<IProcessDuplicateForm>({
    defaultValues: {
      name: `Copy of ${name}`,
      documentType: {
        label: typeof documentType === "string" ? "" : documentType?.name ?? "",
        value:
          documentType && typeof documentType !== "string"
            ? documentType.id
            : "",
      },
      copySharing: true,
      copyTags: true,
      copyNote: true,
    },
  });
  const [documentTypeOptions, setDocumentTypeOptions] = useState<
    IOptionWithIcon<string>[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { handleSubmit, control } = methods;
  async function fetchDocumentTypeOptions(): Promise<void> {
    const filter: IFilter<IDocumentType> = {
      where: { organizationId: String(authStore?.userDetail?.organizationId ?? '') },
      order: ["name ASC"],
    };
    const documentTypes = await getDocumentTypes(filter).catch((e) => {
      console.error("Error fetching document types", e);
      return [];
    });
    const documentTypeOptions = documentTypes.map((documentType) => ({
      label: documentType.name ?? "",
      value: documentType?.id ?? "",
      // icon: documentType?.iconBuilder,
    }));
    setDocumentTypeOptions(documentTypeOptions);
  }

  useEffect(() => {
    fetchDocumentTypeOptions();
  }, [authStore?.userDetail]);

  useEffect(() => {
    return () => {
      methods.reset();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (selectedProcess?.id || process?.id) {
        methods.reset({
          name: `Copy of ${name}`,
          documentType: {
            label: sourceProcess?.documentType?.name,
            value: sourceProcess?.documentType?.id,
          },
          copySharing: true,
          copyTags: true,
          copyNote: true,
        });
      }
    }
  }, [isOpen, selectedProcess, process]);

  async function onSubmit(data: IProcessDuplicateForm) {
    try {
      setIsLoading(true);
      const newProcess: IProcess = await duplicateProcess(processId, {
        documentTypeId: data?.documentType?.value,
        copySharing: data?.copySharing,
        copyTags: data?.copyTags,
        copyNote: data?.copyNote,
        name: data?.name,
      });
      if (newProcess?.id && processId !== newProcess?.id) {
        toast.success("Process duplicated successfully");
        navigate(routes.processes.processId.value(String(newProcess?.id)));
      } else {
        throw new Error("Error duplicating process");
      }
    } catch (error) {
      toast.error("Error duplicating process");
    }
    setIsLoading(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" autoFocus>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton border="none" backgroundColor="white" />
        <ModalHeader
          fontWeight="500"
          fontSize="18px"
          lineHeight="28px"
          color="gray.800"
          borderBottom="1px solid #E2E8F0"
        >
          Copy process
        </ModalHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody paddingY={6}>
              <Stack spacing={6}>
                <FormInput
                  name="name"
                  label="Process name"
                  placeholder="Enter process name"
                  isRequired={true}
                  rules={{ required: "Process name is required" }}
                />
                <Stack spacing={0}>
                  <FormLabel
                    fontWeight={500}
                    fontSize="16px"
                    lineHeight="24px"
                    color="gray.700"
                  >
                    Document Type
                  </FormLabel>
                  <FormDropdownInput
                    controllerProps={{ name: "documentType", control }}
                    inputProps={{
                      name: "documentType",
                      options: documentTypeOptions,
                      hasIcon: true,
                      hasNoSeparator: true,
                      placeholder: "Choose Document type",
                    }}
                  />
                </Stack>

                <Stack spacing={1}>
                  {/* <FormInput name="copyCollection">
                    <Checkbox
                      color="gray.700"
                      {...methods.register("copyCollection")}
                    >
                      Collection Inclusion
                    </Checkbox>
                  </FormInput> */}
                  <FormInput name="copySharing">
                    <Checkbox
                      color="gray.700"
                      {...methods.register("copySharing")}
                    >
                      Copy all share settings
                    </Checkbox>
                  </FormInput>
                  <FormInput name="copyTags">
                    <Checkbox
                      color="gray.700"
                      {...methods.register("copyTags")}
                    >
                      Copy all existing tags
                    </Checkbox>
                  </FormInput>
                  <FormInput name="copyNote">
                    <Checkbox
                      color="gray.700"
                      {...methods.register("copyNote")}
                    >
                      Copy all notes
                    </Checkbox>
                  </FormInput>
                </Stack>
              </Stack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #E2E8F0" gap={4}>
              <Button variant="white" onClick={onClose} isLoading={isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary.500" isLoading={isLoading}>
                Save
              </Button>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};

export default observer(CopyProcessModal);
