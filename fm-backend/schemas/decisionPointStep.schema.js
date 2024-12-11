import mongoose from "mongoose";
const Schema = mongoose.Schema;

const decisionPointStepSchema = new Schema(
  {
    stepId: { type: Schema.Types.ObjectId, require: true },
    decisionPointId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

decisionPointStepSchema.virtual("step", {
  ref: "Step", //The Model to use
  localField: "stepId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

decisionPointStepSchema.virtual("decisionPoint", {
  ref: "DecisionPoint", //The Model to use
  localField: "decisionPointId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
decisionPointStepSchema.set("toObject", { virtuals: true });
decisionPointStepSchema.set("toJSON", { virtuals: true });

decisionPointStepSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const DecisionPointStep = mongoose.model(
  "DecisionPointStep",
  decisionPointStepSchema
);

export default DecisionPointStep;
