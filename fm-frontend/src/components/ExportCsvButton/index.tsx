import { CSVLink } from "react-csv";

import ButtonWithIcon from "components/ButtonWithIcon";
import { getValidArray } from "utils/common";

interface IExportCsvButtonProps {
  text?: string;
  filename: string;
  data: any[];
  iconChildren: React.ReactNode;
}

const ExportCsvButton = (props: IExportCsvButtonProps) => {
  const { text = 'Export CSV', filename, data, iconChildren } = props
  
  const CSVLinkComponent = CSVLink as unknown as React.ComponentType<any>;

  return (
    <CSVLinkComponent filename={filename} data={getValidArray(data)} target="_blank">
      <ButtonWithIcon iconChildren={iconChildren} text={text} onClick={() => {}} />
    </CSVLinkComponent>
  )
}

export default ExportCsvButton