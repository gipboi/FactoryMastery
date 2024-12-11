import { useEffect, useState } from "react";
import {
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Input as CInput,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import { observer } from "mobx-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { primary500 } from "themes/globalStyles";
import { IFilter, IOption, IOptionWithIcon } from "types/common";
import { getDocumentTypes } from "API/documentType";
// import { editCollectionProcess } from "API/collection";
// import { shareProcessToGroups } from "API/groupProcesses";
import { updateProcessById, upsertProcessTags } from "API/process";
import { getTags } from "API/tag";
import FormDropdownInput from "components/FormInputs/DropdownInput";
import { AuthRoleNameEnum } from "constants/user";
import { IDocumentType } from "interfaces/documentType";
import { ITag } from "interfaces/tag";
import { ITheme } from "interfaces/theme";
import { getValidArray } from "utils/common";
import { getRenderProcess } from "../../utils";
import {
  validatePatternVersion,
  validateVersion,
} from "../SaveDraftDialog/utils";
import { getDefaultValues } from "./utils";
import IconBuilder from "components/IconBuilder";
import ProcedureIcon from "components/Common/ProcedureIcon";

interface IEditProcessModalProps {
  onClose: () => void;
  openQuickViewModal: () => void;
  isOpen: boolean;
}

const EditProcessModal = ({
  onClose,
  isOpen,
  openQuickViewModal,
}: IEditProcessModalProps) => {
  const { processStore, organizationStore, authStore } = useStores();
  const params = useParams();
  const processId = String(get(params, "processId", ""));
  const { process } = processStore;
  const { userDetail } = authStore;
  const ollections = [];
  const organizationId = organizationStore.organization?.id;
  const defaultValues = getDefaultValues(process);
  const methods = useForm({
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const { register, control, reset, handleSubmit } = methods;
  const formId = "edit-process-form";
  const version: string = String(useWatch({ name: "version", control })) || "";
  const currentVersion = process?.version ?? "1.0.0";
  const requiredMessage = "This field is required";
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groupOptions, setGroupOptions] = useState<IOption<number>[]>([]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState<
    IOptionWithIcon<number>[]
  >([]);
  const [tagOptions, setTagOptions] = useState<IOptionWithIcon<number>[]>([]);
  const isBasicUser =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  async function fetchGroupOptions(): Promise<void> {
    // const groupOptions = await collectionStore.fetchGroupOptions(userDetail);
    // setGroupOptions(groupOptions);
  }

  async function fetchDocumentTypeOptions(): Promise<void> {
    const filter: IFilter<IDocumentType> = {
      where: { organizationId: userDetail?.organizationId ?? "" },
      order: ["name ASC"],
    };
    const documentTypes = await getDocumentTypes(filter).catch((e) => {
      console.error("Error fetching document types", e);
      return [];
    });;
    const documentTypeOptions = documentTypes.map((documentType) => ({
      label: documentType.name ?? "",
      value: Number(documentType.id),
      icon: documentType?.iconBuilder,
    }));
    setDocumentTypeOptions(documentTypeOptions);
  }

  async function fetchTagOptions(): Promise<void> {
    const filter: IFilter<ITag> = {
      where: { organizationId: userDetail?.organizationId ?? "" },
      order: ["name ASC"],
    };
    const tags = await getTags(filter).catch((e) => {
      console.error("Error fetching tags", e);
      return [];
    });
    const tagOptions = tags.map((tag) => ({
      label: tag.name ?? "",
      value: Number(tag.id),
    }));
    setTagOptions(tagOptions);
  }

  useEffect(() => {
    if (isOpen) {
      fetchGroupOptions();
      fetchDocumentTypeOptions();
      fetchTagOptions();
      getRenderProcess(processId, processStore);
      // collectionStore.fetchCollectionsByGroup({
      //   fields: { id: true, name: true, organizationId: true, updatedAt: true },
      //   where: {
      //     organizationId,
      //     $or: [
      //       { archivedAt: { $exists: false } },
      //       { archivedAt: { $eq: null } },
      //     ],
      //   },
      // });
    }
    reset(defaultValues);
  }, [isOpen]);

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      const collectionOptions: IOption<number>[] = data?.collections ?? [];
      const collectionIds = collectionOptions.map((option) => option?.value);
      const groupIds = data?.groups.map(
        (option: IOption<number>) => option?.value
      );
      const updatedProcessData = {
        name: data?.name ?? "",
        version: data?.version ?? "",
        releaseNote: data?.releaseNote ?? "",
        editorNote: data?.editorNote ?? "",
        documentTypeId: data?.documentTypeId?.value || undefined,
      };
      await Promise.all([
        updateProcessById(process?.id, updatedProcessData),
        upsertProcessTags(
          process?.id,
          getValidArray<IOption<string>>(data?.tags).map(
            (tag: IOption<string>) => tag?.value ?? ""
          )
        ),
        // shareProcessToGroups(groupIds, processId),
        // editCollectionProcess({ processId, collectionIds }),
      ]);

      await getRenderProcess(processId, processStore);
      toast.success("Update process summary successfully");
      onClose();
      openQuickViewModal();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      toast.error("Update process summary failed");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontWeight="500"
          fontSize="18px"
          lineHeight="28px"
          borderBottom="1px solid #E2E8F0"
          color="gray.800"
        >
          Process Summary
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="white"
          top="15px"
          _focus={{ borderColor: "unset" }}
          _active={{ background: "white", borderColor: "unset" }}
        />
        <FormProvider {...methods}>
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <ModalBody paddingTop="24px" paddingBottom="27px">
              <HStack
                fontWeight={600}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
              >
                {process?.documentType?.iconBuilder ? (
                  <IconBuilder
                    icon={process?.documentType?.iconBuilder}
                    size={40}
                    isActive
                  />
                ) : (
                  <ProcedureIcon
                    procedureIcon={process?.procedureIcon}
                    size={40}
                  />
                )}
                <span>{process?.name}</span>
              </HStack>
              <FormLabel
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="8px"
              >
                Process Name
              </FormLabel>
              <CInput
                fontWeight={400}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                placeholder="Enter name"
                focusBorderColor={currentTheme?.primaryColor ?? primary500}
                {...register("name", { required: requiredMessage })}
              />

              <FormLabel
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="8px"
              >
                Process Draft Version
              </FormLabel>
              <CInput
                fontWeight={400}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                placeholder="Enter draft version"
                onKeyDown={(event: any) =>
                  validatePatternVersion(event, version)
                }
                {...register("version", {
                  required: requiredMessage,
                  validate: (value) =>
                    validateVersion(currentVersion, value, true) ||
                    "Cannot make version smaller",
                })}
                focusBorderColor={currentTheme?.primaryColor ?? primary500}
              />

              <FormLabel
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="8px"
              >
                Release Note
              </FormLabel>
              <CInput
                focusBorderColor={currentTheme?.primaryColor ?? primary500}
                fontWeight={400}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                placeholder="Enter release note"
                {...register("releaseNote")}
              />
              {!isBasicUser && (
                <>
                  <FormLabel
                    fontWeight={500}
                    fontSize="16px"
                    lineHeight="24px"
                    color="gray.700"
                    marginTop="24px"
                    marginBottom="8px"
                  >
                    Editor Note
                  </FormLabel>
                  <CInput
                    fontWeight={400}
                    focusBorderColor={currentTheme?.primaryColor ?? primary500}
                    fontSize="16px"
                    lineHeight="24px"
                    color="gray.700"
                    placeholder="Enter editor note"
                    {...register("editorNote")}
                  />
                </>
              )}
              <FormLabel
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="8px"
              >
                Document Type
              </FormLabel>
              <FormDropdownInput
                controllerProps={{ name: "documentTypeId", control }}
                inputProps={{
                  name: "documentTypeId",
                  options: documentTypeOptions,
                  hasIcon: true,
                  hasNoSeparator: true,
                  placeholder: "Choose Document type",
                }}
              />

              <FormLabel
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="-6px"
              >
                Groups
              </FormLabel>
              <FormDropdownInput
                controllerProps={{ name: "groups", control }}
                inputProps={{
                  options: groupOptions,
                  isMulti: true,
                  hasNoSeparator: true,
                  placeholder: "Select groups",
                }}
              />

              <FormLabel
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="-6px"
              >
                Collections
              </FormLabel>
              {/* <FormDropdownInput
                controllerProps={{ name: "collections", control }}
                inputProps={{
                  options: createOptions(collections),
                  isMulti: true,
                  hasNoSeparator: true,
                  placeholder: "Select collections",
                }}
              /> */}

              <FormLabel
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="-6px"
              >
                Tags
              </FormLabel>
              <FormDropdownInput
                controllerProps={{ name: "tags", control }}
                inputProps={{
                  options: tagOptions,
                  isMulti: true,
                  hasNoSeparator: true,
                  placeholder: "Select tags",
                }}
              />
            </ModalBody>

            <ModalFooter justifyContent="center" paddingBottom="24px">
              <Button
                variant="outline"
                borderRadius="6px"
                color="white"
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                background={currentTheme?.primaryColor ?? "primary.500"}
                _hover={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                _active={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                _focus={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                isLoading={isLoading}
                form={formId}
                type="submit"
              >
                Save
              </Button>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};

export default observer(EditProcessModal);
