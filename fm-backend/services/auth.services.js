import createError from "http-errors";
import Organization from "../schemas/organization.schema.js";
import User from "../schemas/user.schema.js";
import {
  generateJWT,
  getDecodedToken,
  handleError,
  hashPassword,
  successHandler,
  toCaseInsensitive,
  validatePassword,
} from "../utils/index.js";
import { getResetPasswordGeneralTemplate } from "../utils/mail.js";
import { MailService } from "./mail.service.js";
import { OrganizationService } from "./organization.services.js";
import { UserService } from "./user.services.js";

export class AuthService {
  organizationService = null;
  userService = null;
  constructor() {
    this.organizationService = new OrganizationService();
    this.userService = new UserService();
  }

  async login(req, res, next) {
    try {
      const { email, password } = req?.body;

      //*INFO: Validate payload
      if (!email) {
        throw createError(400, "Email is required");
      }
      if (!password) {
        throw createError(400, "Password is required");
      }

      const userData = await User.findOne({
        email: toCaseInsensitive(email),
      }).populate("organization");

      if (!userData) {
        throw createError(400, "Email not exist");
      }

      if (userData?.disabled) {
        throw createError(403, "User is disabled");
      }

      const isValidPassword = await validatePassword(
        password,
        userData?.encryptedPassword
      );
      if (!isValidPassword) {
        throw createError(404, "Invalid password!");
      }

      const token = generateJWT({
        email: userData.email,
        id: userData._id,
        authRole: userData.authRole,
        organizationId: userData.organizationId,
        fullName: userData.fullName,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      await User.findOneAndUpdate(
        {
          _id: userData,
        },
        {
          tokens: token,
          lastSignInAt: userData?.currentSignInAt ?? new Date(),
          currentSignInAt: new Date(),
        }
      );

      successHandler(
        res,
        {
          user: {
            email: userData.email,
            id: userData._id,
            authRole: userData.authRole,
            image: userData.image,
            fullName: userData.fullName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            tokens: token,
            organizationId: userData.organizationId,
            organization: {
              name: userData?.organization?.[0]?.name ?? "",
            },
          },
        },
        "Login Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/auth.services.ts", "login");
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const body = req?.body;
      const { email, subdomain } = body;

      const [user, organization] = await Promise.all([
        User.findOne({
          email: toCaseInsensitive(email),
        }),
        Organization.findOne({
          subdomain: toCaseInsensitive(subdomain),
        }),
      ]);

      if (!user) {
        throw createError(400, "Email not exist");
      }

      if (!organization) {
        throw createError(400, "Organization not exist");
      }

      const resetPasswordToken = generateJWT({
        email: user?.email ?? "",
        id: user?._id ?? "",
        authRole: user?.authRole ?? "",
        organizationId: user?.organizationId ?? "",
        fullName: user?.fullName ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
      });
      const mailService = new MailService();

      await User.findOneAndUpdate(
        {
          _id: user,
        },
        {
          resetPasswordToken,
        }
      );

      await mailService.sendEmail({
        to: user?.email,
        subject: "Reset Password",
        htmlString: getResetPasswordGeneralTemplate({
          name:
            user?.fullName ?? (user?.firstName + " " + user?.lastName)?.trim(),
          resetPasswordToken,
          subdomain: organization?.subdomain,
        }),
      });

      successHandler(res, {}, "Reset password Successfully");
    } catch (error) {
      handleError(next, error, "services/auth.services.ts", "forgotPassword");
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req?.body;
      const decodedToken = getDecodedToken(resetToken);

      const user = await User.findOne({
        _id: decodedToken?._id,
        resetPasswordToken: resetToken,
      });

      if (!user) {
        throw createError(400, "Invalid token");
      }

      const encryptedPassword = await hashPassword(newPassword);

      await User.findOneAndUpdate(
        {
          _id: user,
        },
        {
          encryptedPassword,
          resetPasswordToken: "",
        }
      );

      successHandler(res, {}, "Reset password Successfully");
    } catch (error) {
      handleError(next, error, "services/auth.services.ts", "resetPassword");
    }
  }

  logout(req, res) {}

  async signUpOrganization(req, res, next) {
    try {
      let { organization, userData } = req?.body;

      organization = await this.organizationService.validateOrganization(
        organization
      );
      const createdOrganization = await Organization.create(organization);

      userData.organizationId = createdOrganization?.id;
      userData.encryptedPassword = userData?.password;
      userData = await this.userService.validateUser(userData);
      userData.encryptedPassword = await hashPassword(
        userData.encryptedPassword
      );

      const createdUser = await User.create(userData);

      successHandler(
        res,
        { organization: createdOrganization, user: createdUser },
        "Sign Up Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/auth.services.ts",
        "signUpOrganization"
      );
    }
  }
}
