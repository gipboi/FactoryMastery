import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const supportMessageThreadStatusHistorySchema = new Schema(
  {
    status: { type: Number, required: true },
    threadId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

supportMessageThreadStatusHistorySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
supportMessageThreadStatusHistorySchema.set('toObject', { virtuals: true });
supportMessageThreadStatusHistorySchema.set('toJSON', { virtuals: true });

supportMessageThreadStatusHistorySchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

const SupportMessageThreadStatusHistory = mongoose.model('SupportMessageThreadStatusHistory', supportMessageThreadStatusHistorySchema);

export default SupportMessageThreadStatusHistory;