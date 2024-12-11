export function truncatePagination(
  currentPage: number,
  numberOfPages: number
): (string | number)[] {
  try {
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    const result: (number | string)[] = [];
    let lastItem: number;

    const rawDisplayPageRange = Array.from(
      { length: numberOfPages },
      (_, item) => item + 1
    );
    const processedDisplayPageRange = rawDisplayPageRange.filter(
      (page) =>
        page === 1 || page === numberOfPages || (page >= left && page < right)
    );

    processedDisplayPageRange.forEach((page) => {
      if (lastItem) {
        if (page - lastItem === 2) {
          result.push(lastItem + 1);
        } else if (page - lastItem !== 1) {
          result.push("...");
        }
      }
      result.push(page);
      lastItem = page;
    });

    return result;
  } catch (error: any) {
    console.error(
      "components/Pagination/utils.ts ->",
      "truncatePagination ->",
      error
    );
    return [];
  }
}
