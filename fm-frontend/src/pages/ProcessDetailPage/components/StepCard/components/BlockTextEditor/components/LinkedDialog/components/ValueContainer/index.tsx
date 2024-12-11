import { components as Components, OptionProps } from 'react-select'
import SvgIcon from 'components/SvgIcon'
import styles from './valueContainer.module.scss'

const ValueContainer = (props: OptionProps<object, boolean>) => {
  const { children } = props

  return (
    <Components.ValueContainer {...props}>
      {!!children && (
        <div className={styles.container}>
          <SvgIcon iconName="search-icon" />
        </div>
      )}
      {children}
    </Components.ValueContainer>
  )
}

export default ValueContainer
