import mongoose from "mongoose";
const Schema = mongoose.Schema;

const documentTypeSchema = new Schema(
  {
    name: { type: String, require: true },
    description: String,
    organizationId: { type: Schema.Types.ObjectId, require: true },
    createdBy: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

documentTypeSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

documentTypeSchema.virtual("creator", {
  ref: "User", //The Model to use
  localField: "createdBy", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
documentTypeSchema.set("toObject", { virtuals: true });
documentTypeSchema.set("toJSON", { virtuals: true });

documentTypeSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const DocumentType = mongoose.model("DocumentType", documentTypeSchema);

export default DocumentType;
