import mongoose from "mongoose";

const Schema = mongoose.Schema;

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    phone: String,
    license: String,
    trialExpirationDate: { type: Date },
    status: { type: Number },
    subdomain: { type: String, required: true, unique: true },
    role: String,
    publicProcessUrl: String,
    image: String,
    logo: String,
    dashboardBannerText: String,
    horizontalLogo: String,
    welcomeMessageContent: String,
    welcomeMessageText: String,
    welcomeMessageImage: String,
    isLightSideBar: { type: Boolean, default: false },
    sidebarIconColor: { type: String },
    isThemeSetting: { type: Boolean, default: false },
    isModularProcess: { type: Boolean, default: false },
    isReportTool: { type: Boolean, default: false },
    isCollectionFeature: { type: Boolean, default: false },
    isMarketPlace: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

// Set Object and Json property to true. Default is set to false
organizationSchema.set("toObject", { virtuals: true });
organizationSchema.set("toJSON", { virtuals: true });

organizationSchema.pre("validate", function (next) {
  next();
});

// Middleware to update the `updatedAt` field before saving
organizationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
