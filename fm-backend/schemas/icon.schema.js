import mongoose from 'mongoose';
import { EIconShape, EIconType } from '../constants/enums/icon.enum';
const Schema = mongoose.Schema;

const iconSchema = new Schema(
  {
    shape: { type: String, enum: EIconShape },
    iconName: { type: String },
    color: { type: String },
    type: { type: String, enum: EIconType },
    description: { type: String },
    isDark: { type: Boolean },
    isDefaultIcon: { type: Boolean, default: false },
    organizationId: { type: Schema.Types.ObjectId, require: true },
  },
  {
    timestamps: true,
  }
);

iconSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
});

iconSchema.virtual('documentTypes', {
  ref: 'DocumentType',
  localField: '_id',
  foreignField: 'iconId',
  strictPopulate: false,
  sort: { position: 1 },
});

// Set Object and Json property to true. Default is set to false
iconSchema.set('toObject', { virtuals: true });
iconSchema.set('toJSON', { virtuals: true });

iconSchema.pre('validate', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Icon = mongoose.model('Icon', iconSchema);

export default Icon;
