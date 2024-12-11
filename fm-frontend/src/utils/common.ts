// import { S3FileTypeEnum } from 'constants/aws'
// import { MediaType } from 'constants/media'
import { LIMIT_PAGE_BREAK } from "constants/pagination";
// import { IMedia } from 'interfaces/media'
// import { getS3FileUrl } from './images'

export function checkValidArray<T>(array?: T[]): boolean {
  return array ? Array.isArray(array) && array.length > 0 : false;
}

export function getValidArray<T>(array?: T[]): T[] {
  if (array === undefined) {
    return [];
  }
  return checkValidArray(array) ? array : [];
}
export function getValidDefaultArray<T>(array?: T[]): T[] {
  if (array === undefined) {
    return [];
  }
  return checkValidArray(array) ? array : [array as T];
}

export function getDefaultPageSize(): number {
  const pageSizeFromLocalStorage = localStorage.getItem("pageSize");
  const defaultPageLimit =
    pageSizeFromLocalStorage && !isNaN(Number(pageSizeFromLocalStorage))
      ? Number(pageSizeFromLocalStorage)
      : LIMIT_PAGE_BREAK;
  return defaultPageLimit;
}

// export function getDirtyValues(dirtyFields: object | boolean, allValues: object): object {
//   // If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
//   // "placeholders" for unchanged elements. `dirtyFields` is true for leaves.
//   if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues
//   // Here, we have an object
//   return Object.fromEntries(
//     Object.keys(dirtyFields).map(key => {
//       //@ts-ignore
//       return [key, getDirtyValues(dirtyFields[key], allValues[key])]
//     })
//   )
// }

// export function getS3FileUrlByMediaType(media: IMedia, organizationId: number) {
//   if (media?.mediaType === MediaTypeEnum.DOCUMENT) {
//     return getS3FileUrl(S3FileTypeEnum.OTHER, organizationId, media?.document)
//   }

//   if (media?.mediaType === MediaTypeEnum.VIDEO) {
//     return getS3FileUrl(S3FileTypeEnum.VIDEO, organizationId, media?.video ?? media?.url ?? '')
//   }

//   return getS3FileUrl(S3FileTypeEnum.IMAGE, organizationId, media?.image ?? media?.originalImage)
// }

export function isEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) || "Enter valid email format";
}

export function generateMatchObjectIdsQuery(from: string, key: string, ids: string[]) {
  return {
    $match: {
      $expr: {
        $anyElementTrue: {
          $map: {
            input: `$${from}`,
            as: `${from}item`,
            in: {
              $in: [
                `$$${from}item.` + key,
                getValidArray(ids).map((id) => ({ $toObjectId: id })),
              ],
            },
          },
        },
      },
    },
  };
}
