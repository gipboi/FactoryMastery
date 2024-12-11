import { HStack } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import SvgIcon from "components/SvgIcon";
import { LIMIT_PAGE_BREAK } from "config/constant";

export interface IPagination {
  includePagination?: boolean;
  totalResults?: number;
  pageIndex: number;
  limit?: number;
  tableLength: number;
  gotoPage: (selectedPage: number) => void;
}

interface IPaginationProps {
  pagination: IPagination;
}

const ProcessPagination = (props: IPaginationProps) => {
  const { pagination } = props;
  const {
    pageIndex: page = 1,
    gotoPage = () => null,
    totalResults = 0,
    limit = LIMIT_PAGE_BREAK,
  } = pagination;
  const pageIndex = Number(page);
  const numberOfPages = Math.ceil(totalResults / limit);

  return (
    <HStack>
      <IconButton
        backgroundColor="#fff"
        border="none"
        width="24px"
        height="24px"
        aria-label="Send email"
        icon={<SvgIcon iconName="prev-icon" color="gray.600" />}
        onClick={() => gotoPage(pageIndex - 1)}
        disabled={pageIndex === 1 ? true : false}
      />
      <IconButton
        backgroundColor="#fff"
        border="none"
        width="24px"
        height="24px"
        aria-label="Send email"
        icon={<SvgIcon iconName="next-icon" color="gray.600" />}
        onClick={() => gotoPage(pageIndex + 1)}
        disabled={pageIndex === numberOfPages ? true : false}
      />
    </HStack>
  );
};

export default ProcessPagination;
