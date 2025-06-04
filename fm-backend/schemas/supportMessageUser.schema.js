import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const supportMessageThreadUserSchema = new Schema(
  {
    supportThreadId: { type: Schema.Types.ObjectId, ref: 'SupportMessageThread', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

supportMessageThreadUserSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

supportMessageThreadUserSchema.virtual('supportMessageThread', {
  ref: 'SupportMessageThread',
  localField: 'supportThreadId',
  foreignField: '_id',
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
supportMessageThreadUserSchema.set('toObject', { virtuals: true });
supportMessageThreadUserSchema.set('toJSON', { virtuals: true });

supportMessageThreadUserSchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Creating index for efficient queries and to ensure one user per thread
supportMessageThreadUserSchema.index({ userId: 1, supportThreadId: 1 }, { unique: true });

const SupportMessageThreadUser = mongoose.model('SupportMessageThreadUser', supportMessageThreadUserSchema);

export default SupportMessageThreadUser;