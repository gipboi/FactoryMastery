import { useEffect, useState } from 'react'
import { MdComment as CommentIcon } from 'react-icons/md'
import { MdEdit as EditIcon } from 'react-icons/md'
import { ReactComponent as FavoriteIcon } from 'assets/icons/favorite.svg'
import { ReactComponent as UnFavoriteIcon } from 'assets/icons/un_favorite.svg'
import { useStores } from 'hooks/useStores'
import { observer } from 'mobx-react'
import { Col, Row } from 'reactstrap'
import { toggleFavorite } from 'API/favorite'
import Button from 'components/Button'
import SvgIcon from 'components/SvgIcon'
import styles from './collectionDetailHeader.module.scss'

interface IHeaderProps {
  showEditCollectionDialog: React.MouseEventHandler<HTMLButtonElement>
  showCommentCollectionDialog: React.MouseEventHandler<HTMLButtonElement>
  userCanEdit: boolean
}

const CollectionDetailHeader = ({
  showEditCollectionDialog,
  showCommentCollectionDialog,
  userCanEdit
}: IHeaderProps) => {
  const { collectionStore, favoriteStore } = useStores()
  const { collection } = collectionStore
  const [isFavorite, setIsFavorite] = useState<boolean>(false)

  function toggleFavoriteProcess(): void {
    setIsFavorite(!isFavorite)
    toggleFavorite({ collectionId: collection?.id })
  }

  useEffect(() => {
    collection?.id &&
      favoriteStore.getIsFavorite({ collectionId: collection?.id }).then(res => {
        setIsFavorite(res)
      })
  }, [collection])

  return (
    <Row className={styles.container}>
      <Col xl="10" lg="10" md="10" sm="10" xs="10" className={styles.labelSection}>
        <SvgIcon iconName="collections" />
        <label className={styles.label}>{collection?.name}</label>
      </Col>
      <Col xl="2" lg="2" md="2" sm="2" xs="2" className={styles.menuSection}>
        {isFavorite ? (
          <FavoriteIcon cursor="pointer" onClick={toggleFavoriteProcess} style={{ alignSelf: 'center' }} />
        ) : (
          <UnFavoriteIcon cursor="pointer" onClick={toggleFavoriteProcess} style={{ alignSelf: 'center' }} />
        )}
        {userCanEdit && (
          <div className={styles.icon}>
            <Button onClick={showEditCollectionDialog}>
              <EditIcon className={styles.commentIcon} />
            </Button>
          </div>
        )}
        <div className={styles.icon} id="more-info">
          <Button onClick={showCommentCollectionDialog}>
            <CommentIcon className={styles.commentIcon} />
          </Button>
        </div>
      </Col>
    </Row>
  )
}

export default observer(CollectionDetailHeader)
