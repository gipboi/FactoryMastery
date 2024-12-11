import { MediaType, MediaTypeEnum } from "constants/media";
import { IMedia } from "interfaces/media";

type EmbedMap = {
  [key: string]: (match: RegExpMatchArray) => string;
};

export function extractMediaByType(
  mediaList: IMedia[],
  type: MediaTypeEnum
): IMedia[] {
  const imageMedia: IMedia[] = Array.isArray(mediaList)
    ? mediaList?.filter((media: IMedia) => media?.mediaType === type)
    : [];

  return imageMedia;
}

// export function convertToEmbedLink(url: string): string {
//   const youTubeRegExp: RegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
//   const match = String(url)?.match(youTubeRegExp)
//   return match?.[2] ? `https://www.youtube.com/embed/${match[2]}` : url
// }

export function convertToEmbedLink(url: string): string {
  // Define the embedding functions for various platforms
  const embedMap: EmbedMap = {
    youtube: (match) => `https://www.youtube.com/embed/${match[2]}`,
    spotify: (match) =>
      `https://open.spotify.com/embed/${match[4]}/${match[5]}`,
    tiktok: (match) => `https://www.tiktok.com/embed/v/${match[3]}`,
  };

  // Regular expressions for different platforms
  const patterns: { [key: string]: RegExp } = {
    youtube: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
    spotify:
      /^(https?:\/\/)?(www\.)?(open\.spotify\.com\/(track|playlist)\/)([^#?&]*).*/,
    tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[^/]+\/video\/([^#?&]*).*/,
  };

  for (const [platform, pattern] of Object.entries(patterns)) {
    const match = url.match(pattern);
    if (match) {
      return embedMap[platform](match);
    }
  }

  return url;
}

export function getOfficeAppLiveUrl(url: string): string {
  if (String(url)?.includes("pdf")) {
    return `https://docs.google.com/viewer?url=${url}&embedded=true`;
  }
  const encodedUrl = encodeURIComponent(url);
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}&wdOrigin=BROWSELINK`;
}
