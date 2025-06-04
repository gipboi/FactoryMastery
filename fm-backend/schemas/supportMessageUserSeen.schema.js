import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const supportMessageThreadUserSeenSchema = new Schema(
  {
    lastSeenAt: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supportThreadId: { type: Schema.Types.ObjectId, ref: 'SupportMessageThread', required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

supportMessageThreadUserSeenSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

supportMessageThreadUserSeenSchema.virtual('supportMessageThread', {
  ref: 'SupportMessageThread',
  localField: 'supportThreadId',
  foreignField: '_id',
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
supportMessageThreadUserSeenSchema.set('toObject', { virtuals: true });
supportMessageThreadUserSeenSchema.set('toJSON', { virtuals: true });

supportMessageThreadUserSeenSchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Creating index for efficient queries
supportMessageThreadUserSeenSchema.index({ userId: 1, supportThreadId: 1 }, { unique: true });

const SupportMessageThreadUserSeen = mongoose.model('SupportMessageThreadUserSeen', supportMessageThreadUserSeenSchema);

export default SupportMessageThreadUserSeen;