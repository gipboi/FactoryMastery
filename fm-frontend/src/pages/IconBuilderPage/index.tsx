import { VStack, useDisclosure } from '@chakra-ui/react';
import { useStores } from 'hooks/useStores';
import { EIconType, IIconBuilder } from 'interfaces/iconBuilder';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailModal from './components/DetailModal';
import IconBuilderItem from './components/IconBuilderItem';

const IconBuilderPage = () => {
  const { iconBuilderStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const { documentTypeIcons, stepIcons, blockIcons } = iconBuilderStore;
  const { isOpen: isOpenDocumentType, onToggle: onToggleDocumentType } =
    useDisclosure({ defaultIsOpen: true });
  const { isOpen: isOpenStep, onToggle: onToggleStep } = useDisclosure({
    defaultIsOpen: true,
  });
  const { isOpen: isOpenBlock, onToggle: onToggleBlock } = useDisclosure({
    defaultIsOpen: true,
  });

  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<EIconType>(
    EIconType.DOCUMENT_TYPE
  );
  const navigate = useNavigate();

  function handleOpenModal(category: EIconType) {
    setSelectedCategory(category);
    onOpenModal();
  }

  function handleSelectIconAndOpenModal(icon: IIconBuilder): void {
    iconBuilderStore.setIconDetail(icon);
    setSelectedCategory(icon?.type ?? EIconType.DOCUMENT_TYPE);
    onOpenModal();
  }

  async function fetchData(): Promise<void> {
    try {
      await iconBuilderStore.fetchCMSIconList([
        {
          $match: {
            $or: [
              { isDefaultIcon: true },
              {
                $expr: {
                  $eq: [
                    '$organizationId',
                    {
                      $toObjectId: organization?.id,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'documentTypes',
            localField: 'documentTypeId',
            foreignField: '_id',
            as: 'documentTypes',
          },
        },
      ]);
    } catch (error: any) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!isOpenModal) {
      fetchData();
    }
  }, [isOpenModal]);

  return (
    <VStack
      spacing={6}
      height="full"
      padding={{ base: 0, md: 6 }}
      paddingTop={6}
    >
      <IconBuilderItem
        isOpen={isOpenDocumentType}
        onToggle={onToggleDocumentType}
        handleSelectIconAndOpenModal={handleSelectIconAndOpenModal}
        title="Document type"
        onOpen={() => {
          handleOpenModal(EIconType.DOCUMENT_TYPE);
        }}
        icons={documentTypeIcons}
      />
      <IconBuilderItem
        isOpen={isOpenStep}
        onToggle={onToggleStep}
        handleSelectIconAndOpenModal={handleSelectIconAndOpenModal}
        title="Step"
        onOpen={() => {
          handleOpenModal(EIconType.STEP);
        }}
        icons={stepIcons}
      />
      <IconBuilderItem
        isOpen={isOpenBlock}
        onToggle={onToggleBlock}
        handleSelectIconAndOpenModal={handleSelectIconAndOpenModal}
        title="Block"
        onOpen={() => {
          handleOpenModal(EIconType.BLOCK);
        }}
        icons={blockIcons}
      />
      <DetailModal
        isOpen={isOpenModal}
        onClose={onCloseModal}
        type={selectedCategory}
      />
    </VStack>
  );
};

export default observer(IconBuilderPage);
