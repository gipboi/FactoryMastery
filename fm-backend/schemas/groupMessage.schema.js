import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const groupMessageSchema = new Schema(
  {
    content: { type: String },
    attachments: [
      {
        url: { type: String },
        name: { type: String },
        type: { type: String },
      },
    ],
    groupThreadId: { type: Schema.Types.ObjectId, ref: 'GroupMessageThread' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupMessageSchema.virtual('groupThread', {
  ref: 'GroupMessageThread',
  localField: 'groupThreadId',
  foreignField: '_id',
});

groupMessageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  strictPopulate: false,
});

groupMessageSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true,
  strictPopulate: false,
});

groupMessageSchema.set('toObject', { virtuals: true });
groupMessageSchema.set('toJSON', { virtuals: true });

groupMessageSchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;
