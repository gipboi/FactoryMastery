import mongoose from "mongoose";
const Schema = mongoose.Schema;

const auditTrailSchema = new Schema(
  {
    request: { type: String },
    response: { type: String },
    route: { type: String },
    status: { type: String },
    method: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Set Object and Json property to true. Default is set to false
auditTrailSchema.set("toObject", { virtuals: true });
auditTrailSchema.set("toJSON", { virtuals: true });

auditTrailSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const AuditTrail = mongoose.model("AuditTrail", auditTrailSchema);

export default AuditTrail;
