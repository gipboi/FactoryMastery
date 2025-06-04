import mongoose from "mongoose";
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },
    processId: { type: Schema.Types.ObjectId },
    collectionId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.virtual("user", {
  ref: "User", //The Model to use
  localField: "userId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

favoriteSchema.virtual("process", {
  ref: "Process",
  localField: "processId",
  foreignField: "_id",
});

favoriteSchema.virtual("collection", {
  ref: "Collection",
  localField: "collectionId",
  foreignField: "_id",
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
favoriteSchema.set("toObject", { virtuals: true });
favoriteSchema.set("toJSON", { virtuals: true });

favoriteSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
