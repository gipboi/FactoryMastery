import { VStack } from "@chakra-ui/react";
import { ReactComponent as LoadingIcon } from "assets/icons/loading.svg";

const GlobalSpinner = () => {
  return (
    <VStack
      position="fixed"
      height="100vh"
      width="100vw"
      top="0"
      left={{ base: 0, md: "50px", lg: "70px" }}
    >
      <LoadingIcon width={154} height={154} />
    </VStack>
  );
};

export default GlobalSpinner;
