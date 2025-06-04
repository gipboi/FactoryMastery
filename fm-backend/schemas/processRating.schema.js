import mongoose from "mongoose";
const Schema = mongoose.Schema;

const processRatingSchema = new Schema(
  {
    review: { type: String },
    rating: { type: Number },
    userId: { type: Schema.Types.ObjectId },
    processId: { type: Schema.Types.ObjectId },
    createdBy: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

processRatingSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

processRatingSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

processRatingSchema.virtual("process", {
  ref: "Process",
  localField: "processId",
  foreignField: "_id",
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
processRatingSchema.set("toObject", { virtuals: true });
processRatingSchema.set("toJSON", { virtuals: true });

processRatingSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const ProcessRating = mongoose.model("ProcessRating", processRatingSchema);

export default ProcessRating;
