import mongoose from "mongoose";
const Schema = mongoose.Schema;

const decisionPointSchema = new Schema(
  {
    title: { type: String },
    position: { type: Number },

    blockId: { type: Schema.Types.ObjectId, require: true },
    createdBy: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

decisionPointSchema.virtual("block", {
  ref: "Block", //The Model to use
  localField: "blockId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});


decisionPointSchema.virtual("user", {
  ref: "User", //The Model to use
  localField: "createdBy", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
decisionPointSchema.set("toObject", { virtuals: true });
decisionPointSchema.set("toJSON", { virtuals: true });

decisionPointSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const DecisionPoint = mongoose.model("DecisionPoint", decisionPointSchema);

export default DecisionPoint;
