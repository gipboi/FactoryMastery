import mongoose from "mongoose";
const Schema = mongoose.Schema;

const collectionProcessSchema = new Schema(
  {
    position: { type: Number },
    collectionId:  { type: Schema.Types.ObjectId },
    processId:  { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

collectionProcessSchema.virtual("collection", {
  ref: "Collection", 
  localField: "collectionId",
  foreignField: "_id",
  justOne: true,
});

collectionProcessSchema.virtual("process", {
  ref: "Process", 
  localField: "processId",
  foreignField: "_id",
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
collectionProcessSchema.set("toObject", { virtuals: true });
collectionProcessSchema.set("toJSON", { virtuals: true });

collectionProcessSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const CollectionProcess = mongoose.model("CollectionProcess", collectionProcessSchema);

export default CollectionProcess;
