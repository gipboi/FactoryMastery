import cx from "classnames";
import Icon from "../../components/Icon";
// import { LIMIT_PAGE_BREAK } from "configs/constants";
import styles from "./pagination.module.scss";

export interface IPagination {
  includePagination?: boolean;
  totalResults?: number;
  tableLength: number;
  pageIndex: number;
  limit?: number;
  gotoPage: (selectedPage: number) => void;
}

interface IPaginationProps {
  pagination: IPagination;
}

const Pagination = (props: IPaginationProps) => {
  const { pagination } = props;
  const {
    pageIndex: page = 1,
    gotoPage = () => null,
    totalResults = 0,
    // limit = LIMIT_PAGE_BREAK,
  } = pagination;
  const pageIndex = Number(page);
  // const numberOfPages = Math.ceil(totalResults / limit);
  // const truncatedPagination = truncatePagination(
  //   Number(pageIndex)
  // Number(numberOfPages)
  // );

  return (
    <div className={cx(styles.container)}>
      <div className={styles.buttonContainer}>
        <button
          className={cx(styles.button, styles.paginationArrow)}
          onClick={() => gotoPage(pageIndex - 1)}
          disabled={pageIndex === 1 ? true : false}
        >
          <span className={styles.textButton}>Previous</span>
          <span className={styles.iconButton}>
            <Icon icon="angle-left" group="unicon" />
          </span>
        </button>
        {/* {truncatedPagination.map((item: string | number, index: number) => {
          const isActive: boolean = pageIndex === item;
          if (isNaN(Number(item))) {
            return (
              <div className={styles.button} key={index}>
                <span>{item}</span>
              </div>
            );
          }
          return (
            <div
              className={cx(styles.button, { [styles.active]: isActive })}
              key={index}
              onClick={() => gotoPage(Number(item))}
            >
              <span className={cx(styles.text, { [styles.active]: isActive })}>
                {item}
              </span>
            </div>
          );
        })} */}
        <button
          className={cx(styles.button, styles.paginationArrow)}
          onClick={() => gotoPage(pageIndex + 1)}
          // disabled={pageIndex === numberOfPages ? true : false}
        >
          <span className={styles.textButton}>Next</span>
          <span className={styles.iconButton}>
            <Icon icon="angle-right" group="unicon" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
