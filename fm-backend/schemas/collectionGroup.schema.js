import mongoose from "mongoose";
const Schema = mongoose.Schema;

const collectionGroupSchema = new Schema(
  {
    position: { type: Number },
    collectionId:  { type: Schema.Types.ObjectId },
    groupId:  { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

collectionGroupSchema.virtual("collection", {
  ref: "Collection", 
  localField: "collectionId",
  foreignField: "_id",
  justOne: true,
});

collectionGroupSchema.virtual("group", {
  ref: "Group", 
  localField: "groupId",
  foreignField: "_id",
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
collectionGroupSchema.set("toObject", { virtuals: true });
collectionGroupSchema.set("toJSON", { virtuals: true });

collectionGroupSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const CollectionGroup = mongoose.model("CollectionGroup", collectionGroupSchema);

export default CollectionGroup;
