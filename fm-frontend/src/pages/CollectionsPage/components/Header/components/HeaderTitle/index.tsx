import { Link } from 'react-router-dom'
import routes from 'routes'
import styles from './styles.module.scss'

interface IHeaderTitleProps {
  groupId?: string
}

const HeaderTitle = ({ groupId }: IHeaderTitleProps) => {
  if (groupId) {
    return (
      <>
        <Link className={styles.anchor} to={routes.groups.value}>
          {'Group'}
        </Link>
        <span className={styles.breadCrumb}>{' > '}</span>
        <Link className={styles.anchor} to={routes.collections.value}>
          {'Collection'}
        </Link>
      </>
    )
  }
  return <>{'Collections'}</>
}

export default HeaderTitle
