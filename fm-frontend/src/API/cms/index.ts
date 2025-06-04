import { api } from "API";

export async function uploadFile(
  organizationId: string,
  type: "image" | "video" | "other",
  file: File,
  onUploadProgress?: (progressEvt: any) => void
): Promise<string> {
  const body = new FormData();
  body.append("file", file, file.name);
  const response = await api.post(`/cms/upload-file`, body, {
    params: { organizationId },
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onUploadProgress ?? (() => {}),
  });

  return response.data?.data?.url;
}

export async function uploadMultipleFiles(
  organizationId: string,
  type: "image" | "video" | "other",
  files: File[],
  onUploadProgress?: (progressEvt: any) => void
): Promise<string[]> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file, file.name));
  const response = await api.post(`/cms/upload-multi-file`, body, {
    params: { organizationId },
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onUploadProgress ?? (() => {}),
  });

  return response.data?.data?.urls;
}
