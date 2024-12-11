import mongoose from "mongoose";
import { MediaTypeEnum } from "../constants/enums/media-type.enum";
const Schema = mongoose.Schema;

const mediaSchema = new Schema(
  {
    name: { type: String },
    image: { type: String },
    position: { type: Number },
    document: { type: String },
    originalImage: { type: String },
    url: { type: String },
    videoThumbnailUrl: { type: String },
    originalFile: { type: String },
    mediaType: { type: String, enum: MediaTypeEnum },

    createdBy: { type: Schema.Types.ObjectId },
    stepId: { type: Schema.Types.ObjectId, require: true },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

mediaSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

mediaSchema.virtual("step", {
  ref: "Step",
  localField: "stepId",
  foreignField: "_id",
});

mediaSchema.virtual("media", {
  ref: "Media",
  localField: "mediaId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
mediaSchema.set("toObject", { virtuals: true });
mediaSchema.set("toJSON", { virtuals: true });

mediaSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Media = mongoose.model("Media", mediaSchema);

export default Media;
