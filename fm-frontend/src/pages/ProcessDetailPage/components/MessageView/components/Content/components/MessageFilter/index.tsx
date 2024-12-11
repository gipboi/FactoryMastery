import { Row, Col } from 'reactstrap'
import SelectField from 'components/SelectField'
import { options } from './constants'
import styles from './messageFilter.module.scss'

const MessageFilter = () => {
  return (
    <Row className={styles.container}>
      <Col className={styles.layout} md="12">
        <div className={styles.title}>Filter comments</div>
        <div className={styles.option}>
          <SelectField placeholder="Manager comment" options={options} />
        </div>
      </Col>
    </Row>
  )
}

export default MessageFilter
