import React from "react";
import { Box } from "@chakra-ui/react";
import cn from "classnames";
import styles from "./styles.module.scss";
import { GroupMemberPermissionEnum } from "constants/enums/group";

function PermissionTag({ role = "Viewer" }: { role: string }) {
  return (
    <Box
      className={cn(styles.tag, {
        [styles.editor]: role === GroupMemberPermissionEnum.EDITOR,
        [styles.viewer]: role === GroupMemberPermissionEnum.VIEWER,
      })}
      w="53px"
      h="24px"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {role}
    </Box>
  );
}

export default PermissionTag;
