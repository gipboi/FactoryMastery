import mongoose from "mongoose";
const Schema = mongoose.Schema;

const decisionPointMediaSchema = new Schema(
  {
    mediaTitle: { type: String },

    mediaId: { type: Schema.Types.ObjectId, require: true },
    decisionPointId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

decisionPointMediaSchema.virtual("media", {
  ref: "Media", //The Model to use
  localField: "mediaId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

decisionPointMediaSchema.virtual("decisionPoint", {
  ref: "DecisionPoint", //The Model to use
  localField: "decisionPointId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
decisionPointMediaSchema.set("toObject", { virtuals: true });
decisionPointMediaSchema.set("toJSON", { virtuals: true });

decisionPointMediaSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const DecisionPointMedia = mongoose.model(
  "DecisionPointMedia",
  decisionPointMediaSchema
);

export default DecisionPointMedia;
