import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const supportMessageSchema = new Schema(
  {
    content: { type: String },
    attachments: [
      {
        url: { type: String },
        name: { type: String },
        type: { type: String }
      }
    ],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supportThreadId: { type: Schema.Types.ObjectId, ref: 'SupportMessageThread', required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

supportMessageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

supportMessageSchema.virtual('supportMessageThread', {
  ref: 'SupportMessageThread',
  localField: 'supportThreadId',
  foreignField: '_id',
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
supportMessageSchema.set('toObject', { virtuals: true });
supportMessageSchema.set('toJSON', { virtuals: true });

supportMessageSchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);

export default SupportMessage;