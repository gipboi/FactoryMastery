import { IProcessWithRelations } from "interfaces/process";
import { Dispatch, SetStateAction } from "react";
import ProcessList from "../ProcessList";
import styles from "./styles.module.scss";

interface IProcessTabProps {
  onClickCard: (process: IProcessWithRelations) => void;
  activeTab: string;
  selectedProcessDraftList: string[];
  setSelectedProcessDraftList: Dispatch<SetStateAction<string[]>>;
  handleChangeProcessItem: (
    id: string,
    type: string,
    isToggle: boolean,
    process?: IProcessWithRelations
  ) => void;
  handleChangeAllProcessList: () => void;
  fetchProcessList: () => void;
  isManageMode?: boolean;
}

const ProcessTab = (props: IProcessTabProps) => {
  const { onClickCard, activeTab, isManageMode } = props;

  return (
    <div className={styles.container}>
      <ProcessList
        isManageMode={isManageMode}
        onClickCard={onClickCard}
        activeTab={activeTab}
        handleChangeProcessItem={(
          id: string,
          type: string,
          isToggle: boolean,
          process?: IProcessWithRelations
        ) => props.handleChangeProcessItem(id, type, isToggle, process)}
        handleChangeAllProcessList={() => props.handleChangeAllProcessList()}
        selectedProcessDraftList={props.selectedProcessDraftList}
        setSelectedProcessDraftList={props.setSelectedProcessDraftList}
        fetchProcessList={props.fetchProcessList}
      />
    </div>
  );
};

export default ProcessTab;
