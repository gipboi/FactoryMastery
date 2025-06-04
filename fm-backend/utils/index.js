import * as bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/vars.js";

const { jwtConfig } = config;
const saltRounds = 14;

function successHandler(response, data, message) {
  response.status(200).send({
    data,
    message,
  });
}

function handleError(next, error, filePath, functionName) {
  const errorPath = `Error: ${filePath} -> ${functionName} -> error: ${error}`;
  console.error(errorPath, JSON.stringify(error));

  next(error);
}

function toCaseInsensitive(value) {
  return new RegExp(`^${value}$`, "i");
}

async function hashPassword(password) {
  return bcryptjs.hash(password, saltRounds);
}

async function validatePassword(currentPassword, storedPassword) {
  return bcryptjs.compare(currentPassword, storedPassword);
}

function generateRandomPassword(length = 12) {
  return bcryptjs.genSaltSync(length);
}

function generateJWT(data) {
  const expTime = Math.floor(Date.now() / 1000) + parseInt(jwtConfig.expire);
  return jwt.sign(
    {
      email: data.email,
      _id: data.id,
      authRole: data.authRole,
      organizationId: data.organizationId,
      fullName: data.fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      exp: expTime,
    },
    jwtConfig.secret,
    {
      algorithm: jwtConfig.algorithm,
    }
  );
}

function getDecodedToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}

function getValidArray(array) {
  return Array.isArray(array) ? array : [];
}

function getValidObject(object) {
  return object && typeof object === "object" ? object : object?.toObject();
}

function buildPopulateOptions(includes) {
  let populateOptions = [];

  getValidArray(includes).forEach((include) => {
    if (typeof include === "string") {
      // If include is a string, simply add it to populate options
      populateOptions.push(include);
    } else if (typeof include === "object" && include.relation) {
      // If include is an object, handle it based on the relation and scope
      const populateObject = { path: include.relation };

      // Check if there's a scope to include nested relations
      if (include.scope && include.scope.include) {
        const nestedPopulates = buildPopulateOptions(include.scope.include);
        if (nestedPopulates.length > 0) {
          populateObject.populate = nestedPopulates;
        }
      }

      // Check if there's a where clause
      if (include.scope && include.scope.where) {
        populateObject.match = include.scope.where;
      }

      populateOptions.push(populateObject);
    }
  });

  return populateOptions;
}

export {
  successHandler,
  handleError,
  toCaseInsensitive,
  hashPassword,
  generateRandomPassword,
  validatePassword,
  generateJWT,
  getDecodedToken,
  getValidArray,
  buildPopulateOptions,
  getValidObject,
};
