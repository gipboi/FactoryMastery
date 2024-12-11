import mongoose from "mongoose";
const Schema = mongoose.Schema;

const stepSchema = new Schema(
  {
    name: { type: String, require: true },
    time: { type: String },
    position: { type: Number },
    archived: { type: Boolean, default: false },
    layoutId: { type: Schema.Types.ObjectId },
    processId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

stepSchema.virtual("process", {
  ref: "Process", //The Model to use
  localField: "processId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

stepSchema.virtual("blocks", {
  ref: "Block",
  localField: "_id",
  foreignField: "stepId",
  strictPopulate: false,
  sort: { position: 1 },
});

// Set Object and Json property to true. Default is set to false
stepSchema.set("toObject", { virtuals: true });
stepSchema.set("toJSON", { virtuals: true });

stepSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Step = mongoose.model("Step", stepSchema);

export default Step;
