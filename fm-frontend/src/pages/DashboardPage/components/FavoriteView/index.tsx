import {
  Box,
  GridItem,
  HStack,
  IconButton,
  Img,
  Link,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import icon from 'assets/icons/collections.svg';
import { ReactComponent as FavoriteIcon } from 'assets/icons/favorite.svg';
import imgPlaceholder from 'assets/images/missing_image.png';
import ProcessSummary from 'components/Common/ProcessSummary';
// import CollectionOverview from "components/Pages/CollectionsPage/CollectionOverview";
import { blockIcon } from 'components/Icon';
import SvgIcon from 'components/SvgIcon';
import { useStores } from 'hooks/useStores';
import { IFavoriteWithRelations } from 'interfaces/favorite';
import { observer } from 'mobx-react';
import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import routes from 'routes';
import { getValidArray } from 'utils/common';
import { ITheme } from '../../../../interfaces/theme';
import EmptyResult from '../EmptyResult';
import ModalFavoriteView from '../ModalFavoriteView';
import styles from './styles.module.scss';
import CollectionOverview from 'pages/CollectionsPage/components/CollectionOverview';

const FavoriteView = () => {
  const [selectedCollectionId, setSelectedCollectionId] =
    React.useState<string>('');
  const {
    isOpen: isOpenDashboard,
    onOpen: onOpenDashboard,
    onClose: onCloseDashboard,
  } = useDisclosure();
  const {
    isOpen: isOpenProcessDetail,
    onOpen: onOpenProcessDetail,
    onClose: onCloseProcessDetail,
  } = useDisclosure();
  const {
    isOpen: isOpenCollectionDetail,
    onOpen: onOpenCollectionDetail,
    onClose: onCloseCollectionDetail,
  } = useDisclosure();
  const { processStore, favoriteStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { favorites } = favoriteStore;
  const navigate = useNavigate();

  const mostRecentFavorite: IFavoriteWithRelations[] =
    getValidArray<IFavoriteWithRelations>(favorites).slice(0, 8);

  async function handleOpenProcessDetail(processId: string): Promise<void> {
    processStore.setSelectedProcessId(processId);
    onOpenProcessDetail();
  }

  function handleOpenCollectionDetail(collectionId: string): void {
    if (collectionId) {
      setSelectedCollectionId(collectionId);
      onOpenCollectionDetail();
    }
  }
  function onImgError(
    evt: React.SyntheticEvent<HTMLImageElement, Event>
  ): void {
    if (evt.currentTarget.src !== icon) {
      evt.currentTarget.src = icon;
    }
  }

  useEffect(() => {
    favoriteStore.fetchFavoriteList({
      include: [
        {
          relation: 'collection',
          scope: {
            where: {
              archivedAt: null as any,
            },
          },
        },
        {
          relation: 'process',
          scope: {
            include: [
              {
                relation: 'documentType',
                scope: {
                  include: ['icon'],
                },
              },
            ],
          },
        },
      ],
      order: ['createdAt DESC'],
    });
  }, []);

  return (
    <VStack
      backgroundColor=" #FFFFFF"
      margin-top="16px"
      borderRadius="8px"
      gap={4}
      width="full"
      alignSelf="flex-start"
    >
      <VStack
        padding={4}
        spacing={4}
        alignItems="flex-start"
        alignSelf="flex-start"
        width="full"
      >
        <HStack
          spacing={4}
          minWidth="max-content"
          justifyContent="space-between"
          width="100%"
        >
          <HStack spacing={2} alignItems="center" alignSelf="flex-start">
            <FavoriteIcon />
            <Text
              fontSize="18px"
              color="gray.800"
              fontWeight="600"
              lineHeight="28px"
              marginBottom={0}
            >
              Your favorites
            </Text>
          </HStack>
          <Box onClick={onOpenDashboard}>
            <Link
              color={currentTheme?.primaryColor ?? 'primary.500'}
              fontSize="16px"
              fontWeight="500"
              lineHeight="24px"
              _hover={{
                color: currentTheme?.primaryColor ?? 'primary.700',
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
            >
              View more
            </Link>
          </Box>
        </HStack>
        {getValidArray(mostRecentFavorite).length === 0 && (
          <EmptyResult
            title="No favorites yet."
            description="You don’t have any favorites."
          />
        )}
        <VStack
          spacing={0}
          alignItems="flex-start"
          alignSelf="flex-start"
          width="full"
          marginBottom="16px"
        >
          {getValidArray(mostRecentFavorite).map(
            (item: IFavoriteWithRelations, index: number) => {
              const collection = item?.collection;
              const collectionImage: string = item?.collection?.mainMedia ?? '';
              const collectionUrl: string = collectionImage
                ? (item.collection?.organizationId ?? '', collectionImage)
                : imgPlaceholder;
              const isProcess: boolean = !!item?.processId;
              const process = (item?.process as any)?.[0];
              if (!!collection || !!process) {
                return (
                  <GridItem
                    width="stretch"
                    key={item?.id ?? index}
                    gap={2}
                    color="gray.700"
                    transition="all 0.2s"
                    paddingX={4}
                    paddingY={3}
                    display="flex"
                    justifyContent="space-between"
                    _hover={{
                      background: 'gray.50',
                      boxShadow: 'sm',
                      color: currentTheme?.primaryColor ?? 'primary.500',
                      transition: 'all 0.2s',
                    }}
                  >
                    <HStack spacing={2} alignItems="flex-start">
                      {isProcess ? (
                        <Box width="40px" className={styles.icon}>
                          <IconBuilder
                            key={`icon-preview-${blockIcon?.id}`}
                            icon={process?.documentType?.icon ?? blockIcon}
                            size={40}
                            isActive={true}
                          />
                        </Box>
                      ) : (
                        <Box width="40px" alignItems="flex-start">
                          <Img
                            src={collectionUrl}
                            onError={onImgError}
                            width="40px"
                            height="40px"
                            borderRadius="8px"
                          />
                        </Box>
                      )}
                      <Text
                        fontSize="16px"
                        color="inherit"
                        fontWeight="500"
                        lineHeight="24px"
                        marginBottom={0}
                        cursor="pointer"
                        maxHeight="48px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        alignSelf="center"
                        onClick={() => {
                          isProcess
                            ? navigate(
                                routes.processes.processId.value(
                                  String(item?.processId ?? '')
                                )
                              )
                            : navigate(
                                routes.collections.collectionId.value(
                                  String(item?.collectionId ?? '')
                                )
                              );
                        }}
                      >
                        {isProcess
                          ? process?.name ?? ''
                          : item?.collection?.name ?? ''}
                      </Text>
                    </HStack>
                    <Box
                      width="32px"
                      height="32px"
                      display={{ base: 'none', md: 'block' }}
                    >
                      <IconButton
                        backgroundColor="#ffffff"
                        aria-label="Quick View"
                        isRound
                        size="sm"
                        border="none"
                        onClick={() =>
                          isProcess
                            ? handleOpenProcessDetail(item?.processId ?? '')
                            : handleOpenCollectionDetail(item?.collectionId ?? '')
                        }
                        icon={<SvgIcon size={16} iconName="ic_detail" />}
                        _hover={{ backgroundColor: '#EDF2F7' }}
                      />
                    </Box>
                    <Box
                      width="24px"
                      height="24px"
                      display={{ base: 'block', md: 'none' }}
                    >
                      <IconButton
                        backgroundColor="#ffffff"
                        aria-label="Quick View"
                        isRound
                        border="none"
                        size="xs"
                        onClick={() =>
                          isProcess
                            ? handleOpenProcessDetail(item?.processId ?? '')
                            : handleOpenCollectionDetail(item?.collectionId ?? '')
                        }
                        icon={<SvgIcon size={20} iconName="ic_detail"></SvgIcon>}
                        _hover={{ backgroundColor: '#EDF2F7' }}
                      />
                    </Box>
                  </GridItem>
                );
              }
            }
          )}
        </VStack>
      </VStack>
      <ProcessSummary
        isOpen={isOpenProcessDetail}
        onClose={onCloseProcessDetail}
      />
      <ModalFavoriteView
        isOpen={isOpenDashboard}
        onClose={onCloseDashboard}
        handleOpenProcessDetail={handleOpenProcessDetail}
        handleOpenCollectionDetail={handleOpenCollectionDetail}
      />

      <CollectionOverview
        collectionId={selectedCollectionId}
        toggle={
          isOpenCollectionDetail
            ? onCloseCollectionDetail
            : onOpenCollectionDetail
        }
        isOpen={isOpenCollectionDetail}
        isCentered
      />
    </VStack>
  );
};

export default observer(FavoriteView);
