import { IconButton, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
// import { updateMediaById } from 'API/media'
import { updateMediaById } from "API/media";
import ConfirmModal from "components/Chakra/ConfirmModal";
import FormInput from "components/Chakra/FormInput";
import DropdownSelection from "components/Dropdown/DropdownSelection";
import SvgIcon from "components/SvgIcon";
import { IMedia } from "interfaces/media";
import { getRenderProcess } from "pages/ProcessDetailPage/utils";

interface IRenameMediaForm {
  label: string;
}

interface IMoreOptionProps {
  media: IMedia;
  handleDeleteMedia: (id: string) => void;
}

const MoreOption = (props: IMoreOptionProps) => {
  const { media, handleDeleteMedia } = props;
  const { processStore } = useStores();
  const methods = useForm<IRenameMediaForm>();
  const { getValues, reset } = methods;
  const [isOpenRenameModal, setIsOpenRenameModal] = useState(false);

  async function handleRenameMediaLabel() {
    const { label } = getValues();
    await updateMediaById(media?._id ?? media?.id ?? "", { name: label });
    await getRenderProcess(processStore.process?.id, processStore);
    setIsOpenRenameModal(false);
    toast.success("Rename media label successfully");
  }

  useEffect(() => {
    reset({ label: media?.name ?? media?.originalFile });
  }, [isOpenRenameModal]);

  return (
    <>
      <Menu closeOnSelect={true} autoSelect={false} computePositionOnMount>
        {({ isOpen }) => (
          <>
            <MenuButton
              as={IconButton}
              minWidth={5}
              height={5}
              isActive={isOpen}
              aria-label="More button"
              variant="outline"
              border={0}
              background="white"
              icon={<SvgIcon size={12} iconName="vertical-dot" />}
            />
            <MenuList
              zIndex="1001"
              maxWidth="140px"
              minWidth="180px"
              border="1px solid #E2E8F0"
            >
              <DropdownSelection
                minWidth="180px"
                width="100%"
                height={9}
                fontSize="16px"
                label="Rename"
                onClick={() => setIsOpenRenameModal(true)}
                icon={<SvgIcon iconName="ic_baseline-edit" size={20} />}
              />
              <DropdownSelection
                minWidth="180px"
                width="100%"
                height={9}
                fontSize="16px"
                label="Delete media"
                color="red.500"
                onClick={() => handleDeleteMedia(media?._id ?? media?.id ?? "")}
                icon={<SvgIcon iconName="trash-red" size={20} />}
              />
            </MenuList>
          </>
        )}
      </Menu>
      <FormProvider {...methods}>
        <form>
          <ConfirmModal
            titleText="Rename"
            bodyText={<FormInput name="label" label="Media Label" />}
            confirmButtonText="Save"
            isOpen={isOpenRenameModal}
            onClose={() => setIsOpenRenameModal(false)}
            onClickAccept={handleRenameMediaLabel}
          />
        </form>
      </FormProvider>
    </>
  );
};

export default MoreOption;
