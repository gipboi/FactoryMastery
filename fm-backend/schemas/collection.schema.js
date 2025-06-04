import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    name: { type: String, require: true },
    description: { type: String },
    mainMedia: { type: String },
    overview: { type: String },
    public: { type: Boolean, default: true },
    isVisible: { type: Boolean },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    createdById: { type: Schema.Types.ObjectId },
    archivedAt: { type: Date },
    publishedDate: { type: Date, default: new Date() },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

collectionSchema.virtual('organization', {
  ref: 'Organization',
  localField: '_id',
  foreignField: 'collectionId',
});

collectionSchema.virtual('createdBy', {
  ref: 'User',
  localField: 'createdById',
  foreignField: '_id',
});

collectionSchema.virtual('collectionsProcesses', {
  ref: 'CollectionProcess',
  localField: '_id',
  foreignField: 'collectionId',
  strictPopulate: false,
});

collectionSchema.virtual('collectionGroups', {  
  ref: 'CollectionGroup',  
  localField: '_id',  
  foreignField: 'collectionId',  
});  

// collectionSchema.virtual("collectionComments", {
//   ref: "CollectionComment",
//   localField: "_id",
//   foreignField: "collectionId",
// });

collectionSchema.virtual('userCollections', {
  ref: 'UserCollection',
  localField: '_id',
  foreignField: 'collectionId',
  strictPopulate: false,
});

// Set Object and Json property to true. Default is set to false
collectionSchema.set('toObject', { virtuals: true });
collectionSchema.set('toJSON', { virtuals: true });

collectionSchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
