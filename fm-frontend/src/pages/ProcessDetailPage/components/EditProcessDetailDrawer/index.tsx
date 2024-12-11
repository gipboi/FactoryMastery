import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  chakra,
  HStack,
  FormLabel,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import { observer } from "mobx-react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { IFilter } from "types/common/query";
import { IOption } from "types/common/select";
import { getDocumentTypes } from "API/documentType";
import { updateProcessById, upsertProcessTags } from "API/process";
import FormInput from "components/Chakra/FormInput";
import FormDropdown from "components/FormDropdown";
import FormDropdownInput from "components/FormInputs/DropdownInput";
import { IDocumentType } from "interfaces/documentType";
import { getValidArray } from "utils/common";
import { getRenderProcess } from "../../utils";
import { getDefaultValues } from "../EditProcessModal/utils";
import { primary500 } from "themes/globalStyles";

interface IProcessDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProcessDetailDrawer = (props: IProcessDetailDrawerProps) => {
  const { isOpen, onClose } = props;
  const params = useParams();
  const processId = String(get(params, "processId", ""));
  const formId = "edit-process-form";

  const { processStore, organizationStore, tagStore, authStore } = useStores();
  const { processDetail } = processStore;
  const { organization } = organizationStore;
  const { userDetail } = authStore;
  const organizationId: string =
    organization?.id ?? userDetail?.organizationId ?? "";
  const currentTheme = organization?.theme ?? {};

  const defaultValues = getDefaultValues(processDetail);
  const methods = useForm({
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const { control, reset, handleSubmit } = methods;
  const [selectedTags, setSelectedTags] = useState<IOption<string>[]>(
    defaultValues?.tags
  );
  const [documentTypeOptions, setDocumentTypeOptions] = useState<
    IOption<string>[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function fetchDocumentTypeOptions(): Promise<void> {
    const filter: IFilter<IDocumentType> = {
      where: { organizationId },
      order: ["name ASC"],
    };
    const documentTypes = await getDocumentTypes(filter).catch((e) => {
      console.error("Error fetching document types", e);
      return [];
    });
    const documentTypeOptions = documentTypes.map((documentType) => ({
      label: documentType.name ?? "",
      value: String(documentType?._id ?? documentType?.id ?? ""),
      icon: documentType?.iconBuilder,
    }));

    setDocumentTypeOptions(documentTypeOptions);
  }

  async function onSubmit(data: any): Promise<void> {
    try {
      let updatedProcessData = {
        name: data?.name ?? "",
        version: data?.version ?? "",
        releaseNote: data?.releaseNote ?? "",
        editorNote: data?.editorNote ?? "",
        documentTypeId: data?.documentTypeId?.value || undefined,
      };

      await Promise.all([
        updateProcessById(processId, updatedProcessData),
        upsertProcessTags(
          processId,
          getValidArray<IOption<string>>(selectedTags).map(
            (tag: IOption<string>) => tag?.value ?? ""
          )
        ),
      ]);
      getRenderProcess(processId, processStore);
      toast.success("Process updated successfully.");
    } catch (error: any) {
      toast.error("Process updated failed.");
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  }

  useEffect(() => {
    if (isOpen) {
      tagStore.fetchTags({
        where: { organizationId },
        order: ["name ASC"],
      });
      fetchDocumentTypeOptions();
    }

    reset(defaultValues);
  }, [isOpen]);

  return (
    <Drawer isOpen={isOpen} size="lg" placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton
          background="white"
          border="none"
          variant="outline"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <DrawerHeader
          borderBottom="1px solid"
          borderColor="gray.200"
          borderBottomWidth="1px"
          color="gray.800"
          fontSize="lg"
        >
          Process detail
        </DrawerHeader>

        <DrawerBody paddingY={4}>
          <FormProvider {...methods}>
            <chakra.form
              id={formId}
              onSubmit={handleSubmit(onSubmit)}
              width="full"
            >
              <VStack spacing={4} align="flex-start">
                <FormInput
                  name="name"
                  label="Process name"
                  autoComplete="off"
                />
                <FormInput
                  name="version"
                  label="Process version"
                  autoComplete="off"
                />
                <FormInput
                  name="releaseNote"
                  label="Release note"
                  autoComplete="off"
                  isRequired={false}
                />
                <FormInput
                  name="editorNote"
                  label="Editor note"
                  autoComplete="off"
                  isRequired={false}
                />

                <FormLabel
                  fontSize="md"
                  color="gray.700"
                  lineHeight={6}
                  marginBottom={0}
                  marginInlineEnd={0}
                  minWidth="200px"
                >
                  Document type
                </FormLabel>
                <FormDropdownInput
                  controllerProps={{ name: "documentTypeId", control }}
                  inputProps={{
                    name: "documentTypeId",
                    // label: 'Document type',
                    options: documentTypeOptions,
                    hasIcon: true,
                    hasNoSeparator: true,
                    placeholder: "Choose Document type",
                  }}
                />

                <FormDropdown
                  isNotPrefill
                  isOpenModal={isOpen}
                  name="tags"
                  label="Tag"
                  placeholder="Search tags"
                  options={getValidArray(tagStore.tags)}
                  selectedOptions={selectedTags}
                  setSelectedOptions={setSelectedTags}
                />
              </VStack>
            </chakra.form>
          </FormProvider>
        </DrawerBody>

        <DrawerFooter
          borderTop="1px solid"
          borderColor="gray.200"
          borderTopWidth="2px"
        >
          <HStack spacing={4}>
            <Button
              color="gray.700"
              background="white"
              fontSize="16px"
              fontWeight={500}
              lineHeight={6}
              border="1px solid #E2E8F0"
              isLoading={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              form={formId}
              type="submit"
              border="0"
              color="white"
              fontSize="16px"
              fontWeight={500}
              lineHeight={6}
              isLoading={isSubmitting}
              background={currentTheme?.primaryColor ?? primary500}
              _hover={{ opacity: currentTheme?.primaryColor ? 0.8 : 1 }}
              _active={{ background: currentTheme?.primaryColor ?? primary500 }}
            >
              Save
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default observer(EditProcessDetailDrawer);
