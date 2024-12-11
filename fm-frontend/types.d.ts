declare module "react-render-html";

declare module "react-video-thumbnail" {
  const VideoThumbnail: React.ComponentType<{
    videoUrl: string;
    thumbnailHandler: (thumbnail: string) => void;
  }>;
  export default VideoThumbnail;
}
