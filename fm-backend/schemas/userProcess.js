import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userProcessSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, require: true },
    processId: { type: Schema.Types.ObjectId, require: true },
    isDirectlyShared: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

userProcessSchema.virtual("process", {
  ref: "Process", //The Model to use
  localField: "processId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

userProcessSchema.virtual("user", {
  ref: "User", //The Model to use
  localField: "userId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
userProcessSchema.set("toObject", { virtuals: true });
userProcessSchema.set("toJSON", { virtuals: true });

userProcessSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const UserProcess = mongoose.model("UserProcess", userProcessSchema);

export default UserProcess;
