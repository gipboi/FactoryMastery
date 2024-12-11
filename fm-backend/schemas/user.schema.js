import mongoose from "mongoose";
import { AuthRoleEnum } from "../constants/enums/auth-role.enum";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String },
    encryptedPassword: { type: String, required: true },
    isInactive: { type: Boolean, default: false },
    firstName: String,
    lastName: String,
    fullName: String,
    mobilePhone: String,
    workPhone: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    image: String,
    authRole: {
      type: String,
      enum: AuthRoleEnum,
      default: AuthRoleEnum.BASIC_USER,
      require: true,
    },
    tokens: String,
    admin: { type: Boolean, default: false },
    owner: { type: Boolean, default: false, require: true },
    superAdmin: { type: Boolean, default: false },
    manager: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    isResetPassword: Boolean,
    resetPasswordToken: String,
    resetPasswordSentAt: { type: Date },
    signInCount: { type: Number, default: 0 },
    currentSignInAt: { type: Date },
    lastSignInAt: { type: Date },
    currentSignInIp: String,
    lastSignInIp: String,
    organizationId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

userSchema.virtual("groupMembers", {
  ref: "GroupMember", //The Model to use
  localField: "_id", //Find in Model, where localField
  foreignField: "userId", // is equal to foreignField
});

userSchema.virtual("userProcesses", {
  ref: "UserProcess", //The Model to use
  localField: "_id", //Find in Model, where localField
  foreignField: "userId", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
