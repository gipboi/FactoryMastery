import { createCollection } from "API/collection";
import Button from "components/Button";
import ProcedureIcon from "components/Common/ProcedureIcon";
import GlobalSpinner from "components/GlobalSpinner";
import Icon from "components/Icon";
import ModalDialog from "components/ModalDialog";
import { Collections } from "constants/collection";
import { ProcessList } from "constants/process";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import { observer } from "mobx-react";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { useEffect, useState } from "react";
import { MdPersonAdd as PersonAddIcon } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import styles from "./creationModal.module.scss";

interface ICreationModalProps {
  isOpen: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  showShareGroupDialog: React.MouseEventHandler<HTMLButtonElement>;
  setRefetchCollectionAfterCreate: () => void;
}

const CreationModal = ({
  isOpen,
  toggle,
  showShareGroupDialog,
  setRefetchCollectionAfterCreate,
}: ICreationModalProps) => {
  const { processStore, authStore, organizationStore } = useStores();
  // const { processList, newProcessGroupIds, isSearching } = processStore; //*INFO: Unactive isSearching
  const { processList, newProcessGroupIds } = processStore;
  const [selectedProcessList, setSelectedProcessList] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionDescription, setCollectionDescription] =
    useState<string>("");
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isVisibleCollection, setIsVisibleCollection] = useState<boolean>(true);

  useEffect(() => {
    setSelectedProcessList([]);
    setCollectionName("");
    setCollectionDescription("");
    setIsVisibleCollection(true);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && loadMore) {
      setPage(page + 1);
      setLoadMore(false);
    }
  }, [loadMore]);

  useEffect(() => {
    handleSearchProcess(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen) {
      const offset: number = ProcessList.LIMIT * (page - 1);
      if (!searchTerm) {
        processStore.getAllProcessList(
          authStore.userDetail?.organizationId ?? "",
          offset
        );
      } else {
        processStore.getAllProcessList(
          authStore.userDetail?.organizationId ?? "",
          offset,
          searchTerm
        );
      }
    }
  }, [page]);

  async function onSubmit(): Promise<void> {
    if (
      collectionName &&
      collectionDescription &&
      selectedProcessList.length > 0
    ) {
      try {
        await createCollection({
          name: collectionName,
          overview: collectionDescription,
          organizationId: organizationStore.organization?.id ?? "",
          processIds: selectedProcessList,
          groupIds: newProcessGroupIds,
          isVisible: isVisibleCollection,
        });
        setRefetchCollectionAfterCreate();
        toast.success(Collections.SUCCESS);
        toggleModal();
      } catch (error: any) {
        toast.error(Collections.FALSE);
      }
    } else {
      toast.warning(Collections.WARNING);
    }
  }

  function handleSelectProcess(id: string): void {
    let newArray: string[] = selectedProcessList;
    if (newArray.indexOf(id) !== -1) {
      newArray.splice(newArray.indexOf(id), 1);
      setSelectedProcessList([...newArray]);
    } else {
      setSelectedProcessList([...newArray, id]);
    }
  }

  function handleSearchProcess(keySearch: string, offset: number = 0): void {
    const organizationId: string = organizationStore.organization?.id ?? "";
    if (keySearch) {
      // processStore.changeSearchText(keySearch, offset, organizationId);
    } else {
      processStore.processList = [];
      setPage(1);
      processStore.getAllProcessList(organizationId, offset);
    }
  }

  function toggleModal(opened?: boolean) {
    if (opened) {
      toggle(opened);
    } else {
      toggle(!isOpen);
    }
    setSearchTerm("");
  }

  return (
    <ModalDialog
      className={styles.utilityModal}
      headless
      headerClassName={styles.overviewHeader}
      bodyClassName={styles.modalBody}
      // toggle={() => toggleModal()} //Ask Tien
      onClose={toggleModal}
      isOpen={isOpen}
      footerStyle={{ border: "none" }}
      title="Create Collection"
    >
      <div
        className={`d-flex justify-content-between ${styles.overviewHeader}`}
      >
        <h5>Create Collection</h5>
        <Button onClick={showShareGroupDialog}>
          <PersonAddIcon className={styles.icon} />
        </Button>
      </div>
      <div className={styles.createModalContainer}>
        <Row>
          <Col lg="5">
            <FormGroup>
              <Label>Collection Name</Label>
              <Input
                type="text"
                name="name"
                onChange={(event) =>
                  setCollectionName(event.currentTarget.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onSubmit();
                  }
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label>Collection Description</Label>
              <Input
                type="textarea"
                name="description"
                onChange={(event) =>
                  setCollectionDescription(event.currentTarget.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.metaKey || event.altKey)
                  ) {
                    onSubmit();
                  }
                }}
              />
            </FormGroup>
            {/* // TODO: Visibility feature, Integrate later
            <Checkbox
              size="lg"
              isChecked={isVisibleCollection}
              onChange={() => {
                setIsVisibleCollection(!isVisibleCollection)
              }}
            >
              <Text color={colors.gray[700]} fontSize="md" lineHeight={6} fontWeight={500} margin={0} defaultChecked>
                Visible for Viewers
              </Text>
            </Checkbox> */}
          </Col>
          <Col lg="7">
            <FormGroup>
              <Label>Processes</Label>
              <div className={styles.searchBox}>
                <Input
                  type="text"
                  placeholder="Search process"
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                />
                <Button onClick={() => setSelectedProcessList([])}>
                  Remove All
                </Button>
              </div>
            </FormGroup>
            <div className={styles.processList}>
              {
                // isSearching
                <></> ? (
                  <div className="d-flex align-items-center justify-content-center p-5">
                    <GlobalSpinner />
                  </div>
                ) : processList.length <= 0 ? (
                  <div className="d-flex align-items-center justify-content-center p-5">
                    <strong>No Data</strong>
                  </div>
                ) : (
                  <ul
                    onScroll={(event) => {
                      const element = event.target as HTMLElement;
                      if (
                        element.scrollTop + element.clientHeight >=
                        element.scrollHeight
                      ) {
                        setLoadMore(true);
                      }
                    }}
                  >
                    {Array.isArray(processList) &&
                      processList.map(
                        (process: IProcessWithRelations, index: number) => (
                          <li
                            key={`${process?.id}-${index}`}
                            onClick={() => handleSelectProcess(process.id)}
                            className={
                              selectedProcessList.indexOf(process.id) !== -1
                                ? "selected"
                                : ""
                            }
                          >
                            {selectedProcessList.indexOf(process.id) !== -1 ? (
                              <div className={styles.customCheckboxChecked}>
                                <Icon
                                  sizes="14"
                                  icon="check"
                                  group="fontawesome"
                                />
                              </div>
                            ) : (
                              <div className={styles.customCheckbox} />
                            )}
                            {process?.documentType?.iconBuilder ? (
                              <IconBuilder
                                icon={process?.documentType?.iconBuilder}
                                size={24}
                                isActive
                              />
                            ) : (
                              <ProcedureIcon
                                procedureIcon={process?.procedureIcon}
                                size={24}
                              />
                            )}
                            <span>{process.name}</span>
                          </li>
                        )
                      )}
                  </ul>
                )
              }
            </div>
          </Col>
        </Row>
        <div
          className="d-flex align-items-center justify-content-end"
          style={{ marginTop: "20px" }}
        >
          <Button
            color="light"
            className={styles.buttonClear}
            onClick={() => toggleModal(false)}
          >
            Cancel
          </Button>
          <Button
            color="info"
            className={styles.buttonConfirm}
            onClick={() => onSubmit()}
          >
            Create
          </Button>
        </div>
      </div>

      <ToastContainer />
    </ModalDialog>
  );
};

export default observer(CreationModal);
