import {
  Divider,
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
import { createStep } from "API/step";
import ChakraFormRadioGroup from "components/ChakraFormRadioGroup";
import FormInput from "components/FormInput";
import { StepNotify, StepPosition } from "constants/processStep";
import { useStores } from "hooks/useStores";
import { EIconType } from "interfaces/iconBuilder";
import { ICreateStepForm, IStep } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import { getRenderProcess } from "pages/ProcessDetailPage/utils/process";
import CustomButton from "pages/UserPage/components/CustomButton";
import { useEffect, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { UpdateBody } from "types/common";
import { allStepPositionOptions } from "./constant";
import useBreakPoint from "hooks/useBreakPoint";
import { EBreakPoint } from "constants/theme";

interface IModalAddStepProps {
  isOpen: boolean;
  procedureId: string;
  handleShowAutosave: () => void;
  onClose: () => void;
}

const ModalAddStep = ({
  isOpen,
  procedureId,
  handleShowAutosave,
  onClose,
}: IModalAddStepProps) => {
  const { processStore, organizationStore, iconBuilderStore } = useStores();
  const { organization } = organizationStore;
  const { defaultIcons } = iconBuilderStore;
  const currentSteps = processStore?.process?.steps ?? [];
  const currentStepIds = currentSteps.map((step) => step.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentTheme: ITheme = organization?.theme ?? {};
  const defaultStepForm: ICreateStepForm = {
    name: "",
    processId: procedureId,
    stepPosition: String(allStepPositionOptions[0]?.value),
  };
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  const methods: UseFormReturn<ICreateStepForm> = useForm<ICreateStepForm>({
    defaultValues: defaultStepForm,
  });
  const { handleSubmit, reset } = methods;
  async function onSubmit(data: ICreateStepForm) {
    setIsLoading(true);
    try {
      const body: UpdateBody<IStep> = {
        name: data?.name ?? "",
        processId: procedureId,
        addOption:
          Number(data?.stepPosition) || StepPosition.AppendToTheEndOfList,
        selectedPosition: 1,
        archived: false,
        iconId: defaultIcons.find((icon) => icon.type === EIconType.STEP)?._id,
      };
      await createStep(body);
      toast.success(StepNotify.SUCCESS);
      await getRenderProcess(procedureId, processStore);
      // await handleShowAutosave();
    } catch (error: any) {
      toast.error(StepNotify.FALSE);
    }
    setIsLoading(false);
    onClose();
  }

  useEffect(() => {
    reset(defaultStepForm);
  }, [isOpen]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent minWidth={!isMobile ? '800px' : 'auto'}>
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              Add New Step
            </ModalHeader>
            <Divider color="gray.200" margin={0} />
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody padding={6}>
              <VStack width="full" alignItems="flex-start" spacing={4}>
                <FormInput
                  name="name"
                  label="Step Name"
                  placeholder="Enter step name"
                  isRequired
                  width="full"
                />

                <VStack width="235px" alignItems="flex-start">
                  <ChakraFormRadioGroup
                    name="stepPosition"
                    label="Step Position"
                    optionsData={allStepPositionOptions}
                  />
                </VStack>
              </VStack>
            </ModalBody>
            <Divider color="gray.200" margin={0} />
            <ModalFooter>
              <HStack justifyContent="flex-end" width="full">
                <HStack>
                  <CustomButton
                    content="Cancel"
                    className="outline"
                    onClick={onClose}
                    isLoading={isLoading}
                  />
                  <CustomButton
                    className={"primary-override"}
                    content="Add"
                    type="submit"
                    isLoading={isLoading}
                  />
                </HStack>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};
export default observer(ModalAddStep);
