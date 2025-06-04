import createError from "http-errors";
import { expressjwt as jwt } from "express-jwt";
import { AuthService } from "../services/auth.services.js";
import config from "../config/vars.js";
import { AuthRoleEnum } from "../constants/enums/auth-role.enum.js";
import User from "../schemas/user.schema.js";
import { getDecodedToken } from "../utils/index.js";

const { jwtConfig } = config;

const authenticate = jwt({
  secret: jwtConfig.secret,
  algorithms: [jwtConfig.algorithm],
  getToken: async (req, res) => {
    const {
      headers: { authorization },
    } = req;

    if (authorization && authorization.split(" ")[0] === "Bearer") {
      const token = authorization.split(" ")[1];
      const decodedToken = getDecodedToken(token);
      const user = await User.findById(decodedToken._id);
      if (!user || user.disabled) {
        return null;
      }
  
      return token;
    }
    return null;
  },
  failWithError: true,
  customUserProperty: 'user',
});

function isOrgAdmin(req, res, next) {
  const { authRole } = req?.auth;
  if (authRole === AuthRoleEnum.ORG_ADMIN) {
    return next();
  } else {
    next(createError(403, "Access Denied"));
  }
}

function isManager(req, res, next) {
  const { authRole } = req?.auth;
  if (authRole === AuthRoleEnum.MANAGER) {
    return next();
  } else {
    next(createError(403, "Access Denied"));
  }
}

function isAdmin(req, res, next) {
  const { authRole } = req?.auth;
  if (
    authRole === AuthRoleEnum.MANAGER ||
    authRole === AuthRoleEnum.ORG_ADMIN
  ) {
    return next();
  } else {
    next(createError(403, "Access Denied"));
  }
}

function isBasicUser(req, res, next) {
  const { authRole } = req?.auth;
  if (authRole === AuthRoleEnum.BASIC_USER) {
    return next();
  } else {
    next(createError(403, "Access Denied"));
  }
}


function isSuperAdmin(req, res, next) {
  const { authRole } = req?.auth;
  if (
    authRole === AuthRoleEnum.SUPER_ADMIN
  ) {
    return next();
  } else {
    next(createError(403, "Access Denied"));
  }
}

// POST
async function login(req, res, next) {
  const authService = new AuthService();
  await authService.login(req, res, next);
  next();
}

// POST
async function forgotPassword(req, res, next) {
  const authService = new AuthService();
  await authService.forgotPassword(req, res, next);
  next();
}

async function signUpOrganization(req, res, next) {
  const authService = new AuthService();
  await authService.signUpOrganization(req, res, next);
  next();
}

// POST
async function resetPassword(req, res, next) {
  const authService = new AuthService();
  await authService.resetPassword(req, res, next);
  next();
}

export default {
  authenticate,
  isOrgAdmin,
  isManager,
  isAdmin,
  isBasicUser,
  isSuperAdmin,
  login,
  forgotPassword,
  resetPassword,
  signUpOrganization,
};
