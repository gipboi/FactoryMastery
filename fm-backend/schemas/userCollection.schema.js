import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userCollectionSchema = new Schema(
  {
    position: { type: Number },
    collectionId:  { type: Schema.Types.ObjectId },
    userId:  { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

userCollectionSchema.virtual("collection", {
  ref: "Collection", 
  localField: "collectionId",
  foreignField: "_id",
});

userCollectionSchema.virtual("user", {
  ref: "User", 
  localField: "userId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
userCollectionSchema.set("toObject", { virtuals: true });
userCollectionSchema.set("toJSON", { virtuals: true });

userCollectionSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const UserCollection = mongoose.model("UserCollection", userCollectionSchema);

export default UserCollection;
