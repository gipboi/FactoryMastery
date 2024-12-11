import SvgIcon, { SvgIconProps } from "components/SvgIcon";
import {
  ProcessDraftType,
  ProcessDraftTypeIcon,
  ProcessType,
  ProcessTypeColors,
  ProcessTypeIcon,
} from "config/constant/enums/process";
import { toProcedureTypeName, toProcessDraftTypeName } from "utils/process";
import styles from "./styles.module.scss";

interface IProcedureIconProps extends Omit<SvgIconProps, "iconName" | "color"> {
  procedureIcon?: { type: ProcessType; color: string };
  procedureDraftIcon?: { type: ProcessDraftType; color: string };
  borderRadius?: string;
  border?: string;
  opacity?: number;
}

const ProcedureIcon = ({
  procedureIcon,
  procedureDraftIcon,
  ...props
}: IProcedureIconProps) => {
  const defaultIcon = {
    color: ProcessTypeColors[0],
    type: ProcessType.PROCESS,
  };

  if (procedureIcon) {
    const icon = toProcedureTypeName(procedureIcon?.type ?? defaultIcon.type);
    return (
      <SvgIcon
        className={styles.procIcon}
        iconName={icon ? ProcessTypeIcon[icon] : ProcessTypeIcon.BOLT}
        style={{
          background: procedureIcon?.color ?? defaultIcon.color,
          fill: "white",
          borderRadius: props.borderRadius ?? "4px",
          border: props?.border ?? undefined,
          opacity: props?.opacity ?? 1,
        }}
        color="white"
        {...props}
      />
    );
  }
  const icon = toProcessDraftTypeName(
    procedureDraftIcon?.type ?? defaultIcon.type
  );
  return (
    <SvgIcon
      className={styles.procIcon}
      iconName={icon ? ProcessDraftTypeIcon[icon] : ""}
      style={{
        background: procedureDraftIcon?.color ?? defaultIcon.color,
        fill: "white",
        minWidth: props?.size ?? 32 + "px",
      }}
      color="white"
      {...props}
    />
  );
};

export default ProcedureIcon;
