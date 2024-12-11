import createError from "http-errors";
import multer from "multer";
import { successHandler, handleError, getValidArray } from "../utils/index.js";
import { v2 as cloudinary } from "cloudinary";
import * as streamifier from "streamifier";

export class CmsService {
  constructor() {}

  async uploadFile(req, res, next) {
    try {
      const result = await new Promise((resolve, reject) => {
        const upload = multer().single("file");
        upload(req, res, async () => {
          const { file } = req;
          if (file) {
            const time = Date.now();
            const sanitizedName = `${file.originalname.replace(/ /g, "-")}`;
            const fileName = `${time}_${sanitizedName}`;
            const folder = "fm";
            this.uploadToCloudinary(folder, fileName, file.buffer)
              .then(resolve)
              .catch(reject);
          }
        });
      });

      successHandler(
        res,
        { url: result?.secure_url ?? "" },
        "Upload File Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/cms.services.js", "uploadFile");
    }
  }

  async uploadMultiFiles(req, res, next) {
    try {
      const result = await new Promise((resolve, reject) => {
        const upload = multer().array("files");
        upload(req, res, async () => {
          const files = request.files;

          Promise.all(
            getValidArray(files).map((file) => {
              const time = Date.now();
              const sanitizedName = `${file.originalname.replace(/ /g, "-")}`;
              const fileName = `${time}_${sanitizedName}`;
              const folder = "fm";
              return this.uploadToCloudinary(folder, fileName, file.buffer)
                .then(resolve)
                .catch(reject);
            })
          )
            .then(resolve)
            .catch(reject);
        });
      });

      successHandler(
        res,
        { url: result?.secure_url ?? "" },
        "Upload File Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/cms.services.js", "uploadMultiFiles");
    }
  }

  uploadToCloudinary(folder, fileName, buffer) {
    return new Promise((resolve, reject) => {
      let cld_upload_stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName,
          //*TODO: Improve performance later
          resource_type: "auto",
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
  }
}
