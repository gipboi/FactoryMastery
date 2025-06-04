import { HStack, VStack } from "@chakra-ui/react";
import ProcedureIcon from "components/Common/ProcedureIcon";
import SvgIcon from "components/SvgIcon";
import { ICollection } from "interfaces/collection";
// import { ICollection } from "interfaces/collection";
import { IProcessWithRelations } from "interfaces/process";
import { IStepWithRelations } from "interfaces/step";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
// import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";

interface IStepDetailProps {
  collections?: ICollection[];
  process?: IProcessWithRelations;
  step?: IStepWithRelations;
}

//*INFO: Delete collections from the interface and the prop
const StepDetail = ({ collections, process, step }: IStepDetailProps) => {
  const canShowCollection =
    Array.isArray(collections) &&
    collections.length > 0 &&
    !!collections?.[0]?.name;
  const canShowStep = !!step?.name;
  const icon = process?.documentType?.iconBuilder;
  const stepIcon = step?.icon;

  return (
    <VStack alignItems="flex-start">
      {canShowCollection && (
        <HStack
          fontWeight={500}
          fontSize="16px"
          lineHeight="24px"
          color="gray.500"
        >
          <SvgIcon size={24} iconName="collection-name-icon" />
          <span>
            {collections?.length === 1
              ? collections[0]?.name
              : "Multiple collections"}
          </span>
        </HStack>
      )}
      <HStack
        fontWeight={600}
        fontSize="16px"
        lineHeight="24px"
        color={canShowStep ? "gray.500" : "gray.700"}
        paddingLeft="32px"
      >
        {icon ? (
          <IconBuilder icon={icon} size={24} isActive />
        ) : (
          <ProcedureIcon procedureIcon={process?.procedureIcon} size={24} />
        )}
        <span>{process?.name}</span>
      </HStack>
      {canShowStep && (
        <HStack
          fontWeight={600}
          fontSize="16px"
          lineHeight="24px"
          color="gray.700"
          paddingLeft="64px"
        >
          {stepIcon ? (
            <IconBuilder icon={stepIcon} size={24} isActive />
          ) : (
            <IconBuilder icon={stepIcon} size={40} isActive />
          )}
          <span>{step?.name}</span>
        </HStack>
      )}
    </VStack>
  );
};

export default StepDetail;
