import mongoose from "mongoose";
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    content: { type: String },

    processId: { type: Schema.Types.ObjectId },
    collectionId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

commentSchema.virtual("process", {
  ref: "Process", //The Model to use
  localField: "processId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

commentSchema.virtual("collection", {
  ref: "Collection",
  localField: "collectionId",
  foreignField: "_id",
});

commentSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
commentSchema.set("toObject", { virtuals: true });
commentSchema.set("toJSON", { virtuals: true });

commentSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
