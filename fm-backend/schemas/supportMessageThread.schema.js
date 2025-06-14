import mongoose from 'mongoose';
import { SupportMessageThreadStatusEnum, SupportMessageThreadPriorityEnum } from '../constants/enums/message.enum';
const Schema = mongoose.Schema;

const supportMessageThreadSchema = new Schema(
  {
    subject: { type: String },
    status: {
      type: Number,
      enum: SupportMessageThreadStatusEnum,
      default: SupportMessageThreadStatusEnum.UNCLAIMED,
      require: true,
    },
    priority: {
      type: String,
      enum: SupportMessageThreadPriorityEnum,
      require: false,
    },
    lastMessageAt: { type: Date },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    stepId: { type: Schema.Types.ObjectId },
    claimedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processId: { type: Schema.Types.ObjectId, ref: 'Process' },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

supportMessageThreadSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true,
});

supportMessageThreadSchema.virtual('supportMessages', {
  ref: 'SupportMessage',
  localField: '_id',
  foreignField: 'supportThreadId',
});

supportMessageThreadSchema.virtual('supportMessageThreadUserSeens', {
  ref: 'SupportMessageThreadUserSeen',
  localField: '_id',
  foreignField: 'supportThreadId',
});

supportMessageThreadSchema.virtual('step', {
  ref: 'Step',
  localField: 'stepId',
  foreignField: '_id',
  justOne: true,
});

supportMessageThreadSchema.virtual('supportMessageThreadUsers', {
  ref: 'SupportMessageThreadUser',
  localField: '_id',
  foreignField: 'supportThreadId',
});

supportMessageThreadSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'supportThreadId',
  // Using the through relationship via SupportMessageThreadUser
  justOne: false,
});

supportMessageThreadSchema.virtual('claimer', {
  ref: 'User',
  localField: 'claimedBy',
  foreignField: '_id',
  justOne: true,
});

supportMessageThreadSchema.virtual('process', {
  ref: 'Process',
  localField: 'processId',
  foreignField: '_id',
  justOne: true,
});

// Set Object and Json property to true. Default is set to false
supportMessageThreadSchema.set('toObject', { virtuals: true });
supportMessageThreadSchema.set('toJSON', { virtuals: true });

supportMessageThreadSchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

const SupportMessageThread = mongoose.model(
  'SupportMessageThread',
  supportMessageThreadSchema
);

export default SupportMessageThread;
